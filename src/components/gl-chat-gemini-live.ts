import {
  Behavior,
  FunctionResponseScheduling,
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Session,
} from "@google/genai";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";

import {
  createBlob,
  createImageBlob,
  decode,
  decodeAudioData,
} from "../lib/glchat-gemini-live/utils";

const VIDEO_FRAME_INTERVAL_MS = 1000;
const TOOL_RESPONSE_DELAY_MS = 10000;

interface AudioAnalyser {
  data: Uint8Array;
  update(): void;
}

class SimpleAnalyser implements AudioAnalyser {
  private analyserNode: AnalyserNode;
  public data: Uint8Array;

  constructor(audioNode: AudioNode) {
    const audioContext = audioNode.context as AudioContext;
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.data = new Uint8Array(this.analyserNode.frequencyBinCount);
    audioNode.connect(this.analyserNode);
  }

  update() {
    this.analyserNode.getByteFrequencyData(this.data);
  }
}

@customElement("gl-chat-gemini-live")
export class GLChatGeminiLive extends LitElement {
  @property({ type: String })
  apiKey: string = "";

  videoElementRef: Ref<HTMLVideoElement> = createRef();
  canvasRef: Ref<HTMLCanvasElement> = createRef();

  private client: GoogleGenAI | undefined;
  private session: Session | undefined;
  private nextStartTime = 0;
  private mediaStream: MediaStream | null | undefined;
  private sourceNode: AudioBufferSourceNode | null | undefined;
  private scriptProcessorNode: ScriptProcessorNode | null | undefined;
  private sources = new Set<AudioBufferSourceNode>();
  private frameInterval: number | null | undefined;
  private animationId?: number;
  private ctx!: CanvasRenderingContext2D;

  // Audio analysers for visualization
  private inputAnalyser?: AudioAnalyser;
  private outputAnalyser?: AudioAnalyser;

  private inputAudioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)({ sampleRate: 16000 });
  private outputAudioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)({ sampleRate: 24000 });

  @state()
  private isRecording: boolean = false;

  @state()
  private status: string = "";

  @state()
  private error: string = "";

  @state()
  private modelTranscript: string = "";

  @state()
  private inputNode: GainNode = this.inputAudioContext.createGain();

  @state()
  private outputNode: GainNode = this.outputAudioContext.createGain();

  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      position: relative;
      overflow: hidden;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        135deg,
        #0a0a1a 0%,
        #1a1a2e 30%,
        #16213e 70%,
        #0f3460 100%
      );
    }

    video {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 280px;
      height: 280px;
      object-fit: cover;
      border-radius: 50%;
      border: 4px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 40px rgba(74, 144, 226, 0.3);
      z-index: 5;
      transition: all 0.3s ease;
    }

    video.recording {
      border-color: #ff4757;
      box-shadow: 0 0 60px rgba(255, 71, 87, 0.5);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.05);
      }
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 10;
    }

    .status-bar {
      position: absolute;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-size: 0.9rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .status-bar.error {
      background: rgba(255, 71, 87, 0.9);
      border-color: rgba(255, 71, 87, 0.3);
    }

    .captions {
      position: absolute;
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%);
      max-width: 80%;
      text-align: center;
      color: white;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(15px);
      padding: 1rem 1.5rem;
      border-radius: 20px;
      font-size: 1.1rem;
      line-height: 1.5;
      max-height: 6rem;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      white-space: pre-wrap;
      opacity: 0;
      animation: fadeIn 0.3s ease forwards;
    }

    .captions:empty {
      display: none;
    }

    @keyframes fadeIn {
      to {
        opacity: 1;
      }
    }

    .controls {
      position: absolute;
      bottom: 8vh;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 1.5rem;
      pointer-events: auto;
    }

    .control-btn {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(15px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      position: relative;
      overflow: hidden;
    }

    .control-btn::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.05)
      );
      border-radius: inherit;
      z-index: -1;
    }

    .start-btn {
      background: linear-gradient(135deg, #ff4757, #ff3742);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .start-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 40px rgba(255, 71, 87, 0.4);
    }

    .start-btn:disabled {
      opacity: 0.5;
      transform: scale(0.9);
      pointer-events: none;
    }

    .stop-btn {
      background: linear-gradient(135deg, #2f3542, #40444b);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .stop-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 40px rgba(47, 53, 66, 0.4);
    }

    .stop-btn:disabled {
      opacity: 0.5;
      transform: scale(0.9);
      pointer-events: none;
    }

    .control-icon {
      width: 32px;
      height: 32px;
      fill: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .audio-indicator {
      position: absolute;
      bottom: 30%;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .audio-indicator.active {
      opacity: 1;
    }

    .audio-bar {
      width: 4px;
      height: 20px;
      background: linear-gradient(to top, #4a90e2, #74b9ff);
      border-radius: 2px;
      animation: audioWave 1.5s ease-in-out infinite;
    }

    .audio-bar:nth-child(2) {
      animation-delay: 0.1s;
    }
    .audio-bar:nth-child(3) {
      animation-delay: 0.2s;
    }
    .audio-bar:nth-child(4) {
      animation-delay: 0.3s;
    }
    .audio-bar:nth-child(5) {
      animation-delay: 0.4s;
    }

    @keyframes audioWave {
      0%,
      100% {
        transform: scaleY(1);
        opacity: 0.7;
      }
      50% {
        transform: scaleY(2);
        opacity: 1;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      video {
        width: 220px;
        height: 220px;
      }

      .captions {
        max-width: 90%;
        font-size: 1rem;
        padding: 0.75rem 1rem;
      }

      .control-btn {
        width: 60px;
        height: 60px;
      }

      .control-icon {
        width: 28px;
        height: 28px;
      }
    }
  `;

  constructor() {
    super();
  }

  private initAudio() {
    this.nextStartTime = this.outputAudioContext.currentTime;
  }

  private initVisualization() {
    if (!this.canvasRef.value) return;

    const ctx = this.canvasRef.value.getContext("2d");
    if (!ctx) return;

    this.ctx = ctx;
    this.resize();
    this._animate();
  }

  private resize() {
    if (!this.canvasRef.value) return;

    const rect = this.getBoundingClientRect();
    this.canvasRef.value.width = rect.width;
    this.canvasRef.value.height = rect.height;
  }

  private _animate() {
    if (!this.ctx || !this.canvasRef.value) return;

    // Update audio data
    this.inputAnalyser?.update();
    this.outputAnalyser?.update();

    const inputData = this.inputAnalyser?.data || new Uint8Array(128);
    const outputData = this.outputAnalyser?.data || new Uint8Array(128);

    // Clear canvas
    this.ctx.clearRect(
      0,
      0,
      this.canvasRef.value.width,
      this.canvasRef.value.height
    );

    // Draw background gradient
    const gradient = this.ctx.createRadialGradient(
      this.canvasRef.value.width / 2,
      this.canvasRef.value.height / 2,
      0,
      this.canvasRef.value.width / 2,
      this.canvasRef.value.height / 2,
      Math.max(this.canvasRef.value.width, this.canvasRef.value.height) / 2
    );
    gradient.addColorStop(0, "rgba(26, 26, 46, 0.8)");
    gradient.addColorStop(1, "rgba(15, 15, 35, 0.9)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      0,
      0,
      this.canvasRef.value.width,
      this.canvasRef.value.height
    );

    // Draw audio visualizations only when recording
    if (this.isRecording) {
      this.drawCircularVisualizer(outputData, "output");
      this.drawCircularVisualizer(inputData, "input");
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  private drawCircularVisualizer(data: Uint8Array, type: "input" | "output") {
    if (!this.canvasRef.value) return;

    const centerX = this.canvasRef.value.width / 2;
    const centerY = this.canvasRef.value.height / 2;
    const baseRadius = type === "output" ? 180 : 140;
    const barCount = 64;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const barHeight = (data[i] / 255) * 80;

      // Enhanced colors and effects
      const intensity = data[i] / 255;
      let color;

      if (type === "output") {
        color = `hsla(${220 + intensity * 40}, 80%, ${60 + intensity * 20}%, ${
          0.8 + intensity * 0.2
        })`;
      } else {
        color = `hsla(${320 + intensity * 40}, 70%, ${50 + intensity * 30}%, ${
          0.6 + intensity * 0.4
        })`;
      }

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = type === "output" ? 4 : 3;
      this.ctx.lineCap = "round";

      // Add glow effect
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 8;

      const startX = Math.cos(angle) * baseRadius;
      const startY = Math.sin(angle) * baseRadius;
      const endX = Math.cos(angle) * (baseRadius + barHeight);
      const endY = Math.sin(angle) * (baseRadius + barHeight);

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Reset shadow
    this.ctx.shadowBlur = 0;

    // Draw center circle with glow
    this.ctx.beginPath();
    this.ctx.arc(0, 0, baseRadius - 15, 0, Math.PI * 2);
    this.ctx.strokeStyle =
      type === "output"
        ? "rgba(74, 144, 226, 0.4)"
        : "rgba(255, 107, 129, 0.4)";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private async initClient() {
    if (!this.apiKey) {
      this.updateError("API key is required");
      return;
    }

    this.initAudio();

    this.client = new GoogleGenAI({
      apiKey: this.apiKey,
      httpOptions: { apiVersion: "v1alpha" },
    });

    this.outputNode.connect(this.outputAudioContext.destination);

    // Initialize audio analysers
    this.inputAnalyser = new SimpleAnalyser(this.inputNode);
    this.outputAnalyser = new SimpleAnalyser(this.outputNode);

    this.initSession();
  }

  private async initSession() {
    const model = "gemini-2.5-flash-preview-native-audio-dialog";

    const get_weather_vegas = {
      name: "get_weather_vegas",
      behavior: Behavior.NON_BLOCKING,
    };

    const tools = [{ functionDeclarations: [get_weather_vegas] }];

    try {
      this.session = await this.client?.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            this.updateStatus("Connected to Gemini Live");
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription?.text) {
              setTimeout(() => {
                this.appendTranscript(
                  message.serverContent?.outputTranscription?.text ?? ""
                );
              }, (this.nextStartTime - this.outputAudioContext.currentTime) * 1000);
            }

            const audio =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData;

            if (audio) {
              this.nextStartTime = Math.max(
                this.nextStartTime,
                this.outputAudioContext.currentTime
              );

              const audioBuffer = await decodeAudioData(
                decode(audio.data ?? ""),
                this.outputAudioContext,
                24000,
                1
              );
              const source = this.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(this.outputNode);
              source.addEventListener("ended", () => {
                this.sources.delete(source);
              });

              source.start(this.nextStartTime);
              this.nextStartTime = this.nextStartTime + audioBuffer.duration;
              this.sources.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of Array.from(this.sources)) {
                source.stop();
                this.sources.delete(source);
              }
              this.nextStartTime = 0;
              this.modelTranscript = "";
            }

            if (message.toolCall && message.toolCall.functionCalls) {
              const functionResponses: any[] = [];
              for (const fc of message.toolCall.functionCalls) {
                const response = {
                  result: { weather: "Sunny, 42 degrees" },
                  scheduling: undefined,
                };
                if (fc.name === "get_weather_vegas") {
                  await new Promise((r) =>
                    setTimeout(r, TOOL_RESPONSE_DELAY_MS)
                  );
                  response.scheduling =
                    FunctionResponseScheduling.INTERRUPT as any;
                }
                functionResponses.push({
                  id: fc.id,
                  name: fc.name,
                  response,
                } as any);
              }
              this.session?.sendToolResponse({
                functionResponses: functionResponses,
              });
            }

            if (message.serverContent?.turnComplete) {
              this.appendTranscript("\n");
            }
          },
          onerror: (e: ErrorEvent) => {
            this.updateError(`Connection error: ${e.message}`);
            this.modelTranscript = "";
          },
          onclose: (e: CloseEvent) => {
            this.updateStatus(`Disconnected: ${e.reason}`);
            this.modelTranscript = "";
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Orus" } },
          },
          tools,
        },
      });
    } catch (e) {
      console.error(e);
      this.updateError("Failed to connect to Gemini Live");
    }
  }

  private appendTranscript(msg: string) {
    this.modelTranscript += msg;
  }

  private updateStatus(msg: string) {
    this.status = msg;
    this.error = "";
  }

  private updateError(msg: string) {
    this.error = msg;
    this.status = "";
  }

  private async startRecording() {
    if (this.isRecording) return;

    this.inputAudioContext.resume();
    this.updateStatus("Requesting camera and microphone access...");

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      this.updateStatus("🔴 Recording in progress");

      // Connect video stream to video element
      if (this.videoElementRef.value) {
        this.videoElementRef.value.srcObject = this.mediaStream;
        this.videoElementRef.value.muted = true;
        await this.videoElementRef.value.play();
      }

      this.sourceNode = this.inputAudioContext.createMediaStreamSource(
        this.mediaStream
      ) as any;
      this.sourceNode?.connect(this.inputNode);

      const bufferSize = 256;
      this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(
        bufferSize,
        1,
        1
      );

      this.scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
        if (!this.isRecording) return;

        const inputBuffer = audioProcessingEvent.inputBuffer;
        const pcmData = inputBuffer.getChannelData(0);

        this.session?.sendRealtimeInput({ media: createBlob(pcmData) });
      };

      this.sourceNode?.connect(this.scriptProcessorNode);
      this.scriptProcessorNode.connect(this.inputAudioContext.destination);

      this.frameInterval = window.setInterval(() => {
        if (!this.isRecording || !this.videoElementRef.value) return;

        const canvas = document.createElement("canvas");
        canvas.width = this.videoElementRef.value.videoWidth;
        canvas.height = this.videoElementRef.value.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(this.videoElementRef.value, 0, 0);

        canvas.toBlob(
          async (blob) => {
            if (!blob) return;
            const imgChunk = await createImageBlob(blob);
            this.session?.sendRealtimeInput({
              media: imgChunk,
            });
          },
          "image/jpeg",
          0.7
        );
      }, VIDEO_FRAME_INTERVAL_MS);

      this.isRecording = true;
    } catch (err) {
      console.error("Error starting recording:", err);
      this.updateError(`Access denied: ${(err as any).message}`);
      this.stopRecording();
    }
  }

  private stopRecording() {
    if (!this.isRecording && !this.mediaStream) return;

    this.updateStatus("Stopping recording...");
    this.isRecording = false;
    this.modelTranscript = "";

    if (this.scriptProcessorNode && this.sourceNode) {
      this.scriptProcessorNode.disconnect();
      this.sourceNode.disconnect();
    }

    this.scriptProcessorNode = null;
    this.sourceNode = null;

    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }

    if (this.videoElementRef.value) {
      this.videoElementRef.value.srcObject = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.updateStatus("Ready to start");
  }

  protected firstUpdated() {
    this.initClient();
    setTimeout(() => {
      this.initVisualization();
    }, 100);

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopRecording();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  render() {
    return html`
      <canvas ${ref(this.canvasRef)}></canvas>

      <video
        ${ref(this.videoElementRef)}
        playsinline
        autoplay
        muted
        class=${this.isRecording ? "recording" : ""}
      ></video>

      <div class="overlay">
        ${this.status || this.error
          ? html`
              <div class="status-bar ${this.error ? "error" : ""}">
                ${this.error || this.status}
              </div>
            `
          : ""}
        ${this.modelTranscript.trim().length > 0
          ? html` <div class="captions">${this.modelTranscript}</div> `
          : ""}

        <div class="audio-indicator ${this.isRecording ? "active" : ""}">
          <div class="audio-bar"></div>
          <div class="audio-bar"></div>
          <div class="audio-bar"></div>
          <div class="audio-bar"></div>
          <div class="audio-bar"></div>
        </div>

        <div class="controls">
          <button
            class="control-btn start-btn"
            @click=${this.startRecording}
            ?disabled=${this.isRecording}
            title="Start Recording"
          >
            <svg class="control-icon" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" fill="white" />
            </svg>
          </button>

          <button
            class="control-btn stop-btn"
            @click=${this.stopRecording}
            ?disabled=${!this.isRecording}
            title="Stop Recording"
          >
            <svg class="control-icon" viewBox="0 0 100 100">
              <rect x="25" y="25" width="50" height="50" rx="8" fill="white" />
            </svg>
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "gl-chat-gemini-live": GLChatGeminiLive;
  }
}
