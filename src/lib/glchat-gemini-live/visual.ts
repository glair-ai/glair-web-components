import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

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

@customElement("gl-chat-gemini-live-audio-visual")
export class SimpleLiveAudioVisuals extends LitElement {
  private inputAnalyser?: AudioAnalyser;
  private outputAnalyser?: AudioAnalyser;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationId?: number;

  @property()
  outputNode: AudioNode | undefined;

  @property()
  inputNode: AudioNode | undefined;

  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      position: relative;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        #0f0f23 0%,
        #1a1a2e 50%,
        #16213e 100%
      );
    }
  `;

  private init() {
    if (!this.canvas) return;

    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    this.ctx = ctx;
    this.resize();
    this._animate();
  }

  private resize() {
    if (!this.canvas) return;

    const rect = this.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  private _animate() {
    if (!this.ctx) return;

    // Update audio data
    this.inputAnalyser?.update();
    this.outputAnalyser?.update();

    const inputData = this.inputAnalyser?.data || new Uint8Array(128);
    const outputData = this.outputAnalyser?.data || new Uint8Array(128);

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background gradient
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height) / 2
    );
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#0f0f23");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw audio visualizations
    this.drawCircularVisualizer(outputData, "output");
    this.drawCircularVisualizer(inputData, "input");

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  private drawCircularVisualizer(data: Uint8Array, type: "input" | "output") {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2 + 96;
    const baseRadius = type === "output" ? 120 : 80;
    const barCount = 64;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const barHeight = (data[i] / 255) * 100;

      // Color based on type and audio intensity
      const intensity = data[i] / 255;
      let color;

      if (type === "output") {
        color = `hsl(${240 + intensity * 60}, 70%, ${50 + intensity * 30}%)`;
      } else {
        color = `hsl(${120 + intensity * 60}, 70%, ${40 + intensity * 30}%)`;
      }

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = "round";

      const startX = Math.cos(angle) * baseRadius;
      const startY = Math.sin(angle) * baseRadius;
      const endX = Math.cos(angle) * (baseRadius + barHeight);
      const endY = Math.sin(angle) * (baseRadius + barHeight);

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Draw center circle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, baseRadius - 10, 0, Math.PI * 2);
    this.ctx.strokeStyle = type === "output" ? "#4a90e2" : "#50c878";
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.3;
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;

    this.ctx.restore();
  }

  protected firstUpdated() {
    this.inputAnalyser = this.inputNode
      ? new SimpleAnalyser(this.inputNode)
      : undefined;
    this.outputAnalyser = this.outputNode
      ? new SimpleAnalyser(this.outputNode)
      : undefined;

    this.canvas = this.shadowRoot!.querySelector("canvas") as HTMLCanvasElement;

    setTimeout(() => {
      this.init();
    }, 100);

    // Handle window resize
    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  protected render() {
    return html`<canvas></canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "gl-chat-gemini-live-audio-visual": SimpleLiveAudioVisuals;
  }
}
