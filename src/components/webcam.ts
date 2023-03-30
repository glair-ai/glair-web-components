import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref, createRef } from "lit/directives/ref.js";

import { TailwindElement } from "./tailwind.element";
import OVERLAY from "../assets/images/passive_overlay.png";
import { base64ToBlob, getScreenshot } from "../utils";
import { ON_RETRY, ON_SCREENSHOT, ON_TRIGGER_SCREENSHOT } from "../constants";

import "./please-wait";
import "./camera-blocked";

@customElement("glair-webcam")
export class Webcam extends TailwindElement {
  @property({ type: Boolean, reflect: true })
  hasMedia = false;
  @property({ type: Object })
  stream: object | null = null;
  @property({ type: Object, state: true })
  videoEl = createRef();
  @property({ type: Boolean, attribute: "own-stream" })
  ownStream = false;
  @property({ type: Boolean })
  mirrored = false;

  @property({ type: Number, attribute: "width" })
  width = 480;
  @property({ type: Number, attribute: "height" })
  height = 480;
  @property({ type: String })
  facingMode = "user";

  @state()
  isCameraAllowed = false;
  setIsCameraAllowed(state: boolean) {
    this.isCameraAllowed = state;
  }
  @state()
  loading = false;
  setLoading(state: boolean) {
    this.loading = state;
  }

  async connectedCallback() {
    super.connectedCallback();

    await this.requestUserMedia();

    // Trigger Screenshot Event Listener to Dispatch Screenshot Blob Image
    window.addEventListener(ON_TRIGGER_SCREENSHOT, async () => {
      this.setLoading(true);
      const base64 = getScreenshot({
        ref: this.videoEl,
        width: this.width,
        height: this.height,
        mirrored: this.mirrored,
      });
      // console.log(base64.substring(0));
      const blob = await base64ToBlob(base64);
      this.dispatch(ON_SCREENSHOT, blob);
    });

    // Result Event Listener to Change Show State
    window.addEventListener(ON_RETRY, () => {
      this.setLoading(false);
    });
  }

  async requestUserMedia() {
    if (this.ownStream) {
      if (this.stream !== null) this.handleUserMedia(this.stream);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.handleUserMedia(stream);
      this.setIsCameraAllowed(true);
    } catch (err) {
      console.log("Error occured", err);
    }
  }

  /** @param {MediaStream} stream */
  handleUserMedia(stream: object) {
    this.stream = stream;

    try {
      if (this.videoEl?.value) {
        const videoEl = this.videoEl.value as HTMLVideoElement;
        videoEl.srcObject = stream as MediaProvider;
      }
      this.hasMedia = true;
    } catch (error) {
      console.log("Error occured on webcam", error);
    }
  }

  /** @param {MediaStream} stream */
  static stopMediaStream(stream: any) {
    if (stream) {
      stream.stop();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    Webcam.stopMediaStream(this.stream);
  }

  render() {
    return html`
      <div class="relative min-h-[480px] max-w-[480px]">
        <div class="h-[${this.height}px] w-[${this.width}px] overflow-hidden">
          <video
            ${ref(this.videoEl)}
            autoplay
            muted
            playsinline
            class="${this.mirrored
              ? "-scale-x-100"
              : ""} relative left-1/2 h-[100%] max-w-none -translate-x-1/2"
          ></video>
        </div>
        <div class="absolute top-[15%] left-[0%] mx-16 my-auto">
          <img
            src=${OVERLAY}
            height="${this.height}"
            width="${this.width}"
            alt="overlay"
          />
        </div>
        <div class="absolute top-[40%] left-[50%] translate-x-[-50%]">
          ${!this.isCameraAllowed
            ? html`<glair-camera-blocked></glair-camera-blocked>`
            : ""}
          ${this.loading ? html`<glair-please-wait></glair-please-wait>` : ""}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-webcam": Webcam;
  }
}
