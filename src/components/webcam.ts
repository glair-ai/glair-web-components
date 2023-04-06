import { html } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import CORNER_OVERLAY from "../assets/images/corner_overlay.png";

import { TailwindElement } from "./tailwind.element";
import { getScreenshot } from "../utils";

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
  _isUserMedia = false;

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
      this._isUserMedia = true;
    } catch (err) {
      console.error("Error occured", err);
    }
  }

  async screenshot() {
    return getScreenshot({
      ref: this.videoEl,
      width: this.width,
      height: this.height,
      mirrored: this.mirrored,
    });
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
          style="width: ${this.width}px; height: ${this
            .height}px; transform: scaleX(${this.mirrored ? "-1" : "1"});"
        ></video>
        ${this.userMediaError()} ${this.userMedia()}
      </div>
    `;
  }

  userMediaError() {
    return html`
      <div style="${!this._isUserMedia ? "display: revert" : "display: none"}">
        <slot name="user-media-error">
          <div
            class="absolute top-[50%] left-[50%] flex w-[300px] translate-y-[-50%] translate-x-[-50%] flex-col rounded-sm border bg-white py-4 px-8"
          >
            <p class="text-[20px]">Camera blocked</p>
            <p class="my-4">
              Please allow camera access in your browser settings and try again.
            </p>
            <div class="flex flex-col items-end">
              <button
                type="button"
                class="text-md text-[#009CDE]"
                .onclick=${() => location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </slot>
      </div>
    `;
  }

  userMedia() {
    return html`
      <div style="${this._isUserMedia ? "display: revert" : "display: none"}">
        <slot name="user-media">
          <img
            src=${CORNER_OVERLAY}
            alt="overlay"
            width="50"
            class="absolute top-12 left-12"
          />
          <img
            src=${CORNER_OVERLAY}
            alt="overlay"
            width="50"
            class="absolute bottom-12 left-12 -rotate-90"
          />
          <img
            src=${CORNER_OVERLAY}
            alt="overlay"
            width="50"
            class="absolute top-12 right-12 rotate-90"
          />
          <img
            src=${CORNER_OVERLAY}
            alt="overlay"
            width="50"
            class="absolute bottom-12 right-12 rotate-180"
          />
        </slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-webcam": Webcam;
  }
}
