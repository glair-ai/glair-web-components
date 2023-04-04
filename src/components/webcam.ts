import { html } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";

import { TailwindElement } from "./tailwind.element";
import CORNER_OVERLAY from "../assets/images/corner_overlay.png";
import { base64ToBlob, getScreenshot } from "../utils";

import "./please-wait";
import "./camera-blocked";

@customElement("glair-webcam")
export class Webcam extends TailwindElement {
  @query("video")
  videoEl!: HTMLVideoElement;

  @property({ type: Number })
  width = 480;

  @property({ type: Number })
  height = 480;

  @property({ type: String })
  facingMode = "user";

  @property({ type: Boolean })
  mirrored = false;

  @state()
  _isCameraAllowed = false;

  async connectedCallback() {
    super.connectedCallback();
    await this.requestUserMedia();
  }

  async requestUserMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facingMode },
      });
      this.videoEl.srcObject = stream;
      this._isCameraAllowed = true;
    } catch (err) {
      console.error("Error occured", err);
    }
  }

  async screenshot() {
    const base64 = getScreenshot({
      ref: this.videoEl,
      width: this.width,
      height: this.height,
      mirrored: this.mirrored,
    });
    console.log({ base64 });
    return await base64ToBlob(base64);
  }

  // https://stackoverflow.com/questions/4000818/scale-html5-video-and-break-aspect-ratio-to-fill-whole-site
  render() {
    return html`
      <div class="relative bg-gray-200">
        <video
          autoplay
          muted
          playsinline
          class="object-cover"
          style="width: ${this.width}px; height: ${this.height}px;"
        ></video>
        ${this.overlayTemplate()}
        <div
          class="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]"
        >
          ${!this._isCameraAllowed
            ? html`<glair-camera-blocked></glair-camera-blocked>`
            : ""}
        </div>
      </div>
    `;
  }

  overlayTemplate() {
    const width = "50px";
    return html`
      <img
        src=${CORNER_OVERLAY}
        alt="overlay"
        width=${width}
        class="absolute top-12 left-12 md:top-16 md:left-16"
      />
      <img
        src=${CORNER_OVERLAY}
        alt="overlay"
        width=${width}
        class="absolute bottom-12 left-12 -rotate-90 md:bottom-16 md:left-16"
      />
      <img
        src=${CORNER_OVERLAY}
        alt="overlay"
        width=${width}
        class="absolute top-12 right-12 rotate-90 md:top-16 md:right-16"
      />
      <img
        src=${CORNER_OVERLAY}
        alt="overlay"
        width=${width}
        class="absolute bottom-12 right-12 rotate-180 md:right-16 lg:bottom-16"
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-webcam": Webcam;
  }
}
