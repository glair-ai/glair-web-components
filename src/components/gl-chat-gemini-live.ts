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
import "../lib/glchat-gemini-live/visual";

const VIDEO_FRAME_INTERVAL_MS = 1000;
const TOOL_RESPONSE_DELAY_MS = 10000;

@customElement("gl-chat-gemini-live")
export class GLChatGeminiLive extends LitElement {
  @property({ type: String })
  apiKey: string = "";

  videoElementRef: Ref<HTMLVideoElement> = createRef();

  private client: GoogleGenAI | undefined;
  private session: Session | undefined;
  private nextStartTime = 0;
  private mediaStream: MediaStream | null | undefined;
  private sourceNode: AudioBufferSourceNode | null | undefined;
  private scriptProcessorNode: ScriptProcessorNode | null | undefined;
  private sources = new Set<AudioBufferSourceNode>();
  private frameInterval: number | null | undefined;

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
    #status {
      position: absolute;
      bottom: 5vh;
      left: 0;
      right: 0;
      z-index: 10;
      text-align: center;
    }

    #captions {
      position: absolute;
      bottom: 50%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      text-align: center;
      max-height: 2em; /* show only 2 lines */
      overflow: hidden;

      color: white;
      background: rgba(0, 0, 0, 0.6);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 16px;

      display: flex;
      flex-direction: column;
      justify-content: flex-end; /* keep latest at bottom */
      white-space: pre-wrap;
    }

    #captions:empty {
      background: none;
      padding: 0;
    }

    .controls {
      z-index: 10;
      position: absolute;
      bottom: 10vh;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;

      button {
        outline: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        width: 64px;
        height: 64px;
        cursor: pointer;
        font-size: 24px;
        padding: 0;
        margin: 0;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      button[disabled] {
        display: none;
      }
    }

    video {
      position: absolute;
      left: calc(50% - 160px);
      width: 320px;
      height: 320px;
      object-fit: cover;
      z-index: 10;
    }

    gl-chat-gemini-live-audio-visual {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 5;
    }
  `;

  constructor() {
    super();
  }

  private initAudio() {
    this.nextStartTime = this.outputAudioContext.currentTime;
  }

  private async initClient() {
    if (!this.apiKey) {
      console.error("API key is required");
      return;
    }

    this.initAudio();

    this.client = new GoogleGenAI({
      apiKey: this.apiKey,
      httpOptions: { apiVersion: "v1alpha" },
    });

    this.outputNode.connect(this.outputAudioContext.destination);

    this.initSession();
  }

  private async initSession() {
    const model = "gemini-2.5-flash-preview-native-audio-dialog";

    // Simple function definitions
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
            this.updateStatus("Opened");
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
                  result: { weather: "Sunny, 42 degres" },
                  scheduling: undefined,
                }; // hard-coded function response
                if (fc.name === "get_weather_vegas") {
                  await new Promise((r) =>
                    setTimeout(r, TOOL_RESPONSE_DELAY_MS)
                  );
                  response.scheduling =
                    FunctionResponseScheduling.INTERRUPT as any;
                  // response.scheduling = FunctionResponseScheduling.WHEN_IDLE;
                  // response.scheduling = FunctionResponseScheduling.SILENT;
                }
                functionResponses.push({
                  id: fc.id,
                  name: fc.name,
                  response,
                } as any as never);
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
            this.updateError(e.message);
            this.modelTranscript = "";
          },
          onclose: (e: CloseEvent) => {
            this.updateStatus("Close:" + e.reason);
            this.modelTranscript = "";
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Orus" } },
            // languageCode: 'en-GB'
          },
          tools,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  private appendTranscript(msg: string) {
    this.modelTranscript += msg;
  }

  private updateStatus(msg: string) {
    this.status = msg;
  }

  private updateError(msg: string) {
    this.error = msg;
  }

  private async startRecording() {
    if (this.isRecording) {
      return;
    }

    this.inputAudioContext.resume();

    this.updateStatus("Requesting microphone access...");

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      this.updateStatus("Microphone access granted. Starting capture...");

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
      this.updateStatus(
        "🔴 Recording... Capturing audio chunks and video frames."
      );
    } catch (err) {
      console.error("Error starting recording:", err);
      this.updateStatus(`Error: ${(err as any).message}`);
      this.stopRecording();
    }
  }

  private stopRecording() {
    if (!this.isRecording && !this.mediaStream && !this.inputAudioContext)
      return;

    this.updateStatus("Stopping recording...");

    this.isRecording = false;

    if (this.scriptProcessorNode && this.sourceNode && this.inputAudioContext) {
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

    this.updateStatus("Recording stopped. Click Start to begin again.");
  }

  protected firstUpdated() {
    this.initClient();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopRecording();
  }

  render() {
    return html`
      <div>
        <video ${ref(this.videoElementRef)} playsinline autoplay muted></video>
        <div style="display: none">${this.status}</div>
        <div id="captions">${this.modelTranscript}</div>
        <div class="controls">
          <button
            id="startButton"
            @click=${this.startRecording}
            ?disabled=${this.isRecording}
          >
            <svg
              viewBox="0 0 100 100"
              width="32px"
              height="32px"
              fill="#c80000"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="50" />
            </svg>
          </button>
          <button
            id="stopButton"
            @click=${this.stopRecording}
            ?disabled=${!this.isRecording}
          >
            <svg
              viewBox="0 0 100 100"
              width="32px"
              height="32px"
              fill="#000000"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" y="0" width="100" height="100" rx="15" />
            </svg>
          </button>
        </div>

        <div id="status">${this.error}</div>
        <gl-chat-gemini-live-audio-visual
          .inputNode=${this.inputNode}
          .outputNode=${this.outputNode}
        ></gl-chat-gemini-live-audio-visual>
      </div>
    `;
  }
}

// Type declaration to make TypeScript happy with the custom element
declare global {
  interface HTMLElementTagNameMap {
    "gl-chat-gemini-live": GLChatGeminiLive;
  }
}
