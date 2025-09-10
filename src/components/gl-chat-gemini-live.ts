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
import {
  createBlob,
  createImageBlob,
  decode,
  decodeAudioData,
} from "../lib/glchat-gemini-live/utils";
import "../lib/glchat-gemini-live/visual";

@customElement("gl-chat-gemini-live")
export class GLChatGeminiLive extends LitElement {
  @property({ type: String })
  apiKey: string = "";

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
      z-index: 5;
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
                  console.log("[TOOL] call get_weather");
                  await new Promise((r) => setTimeout(r, 10000));
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
                console.log("[TOOL] finished get_weather");
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

      const videoElement = document.createElement("video");
      videoElement.srcObject = this.mediaStream;
      videoElement.muted = true;
      videoElement.play();

      this.frameInterval = window.setInterval(() => {
        if (!this.isRecording) return;

        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(videoElement, 0, 0);

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
      }, 1000);

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

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.updateStatus("Recording stopped. Click Start to begin again.");
  }

  private reset() {
    this.session?.close();
    this.initSession();
    this.updateStatus("Session cleared.");
  }

  protected firstUpdated() {
    this.initClient();
  }

  render() {
    return html`
      <div>
        <div style="display: none">${this.status}</div>
        <div id="captions">${this.modelTranscript}</div>
        <div class="controls">
          <button
            id="resetButton"
            @click=${this.reset}
            ?disabled=${this.isRecording}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="40px"
              viewBox="0 -960 960 960"
              width="40px"
              fill="#ffffff"
            >
              <path
                d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"
              />
            </svg>
          </button>
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
