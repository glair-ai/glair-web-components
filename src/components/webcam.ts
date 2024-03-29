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

  @property({ type: String })
  screenshotArea = JSON.stringify({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    enableOverlay: false,
  });

  @state()
  _isUserMedia = false;

  @state()
  _stream: MediaStream | null = null;

  @state()
  _screenshotAreaObj: ScreenshotArea = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    enableOverlay: false,
  };

  // Why need this:
  // 1. User navigates to a page with getUserMedia needs time.
  // 2. Before userGetMedia returns, user navigates to other page.
  // 3. disconnectedCallback is called but the stopStream will not have effect as there's no stream
  // So we keep track of isMounted and call stopStream after getUserMedia returns if the component is unmounted.
  @state()
  _isMounted = true;

  async connectedCallback() {
    super.connectedCallback();
    await this.requestUserMedia();
    this._screenshotAreaObj = this.preProcessScreenshotArea();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this._isMounted = false;

    // Why need this: when the web is Single Page Application (SPA) and user navigates to another page.
    // As it's an SPA, it will not be a full refresh. Hence, if we don't stop the stream, the camera will be still active.
    this.stopStream();
  }

  async requestUserMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facingMode },
      });
      this._stream = stream;
      this.videoEl.srcObject = stream;
      this._isUserMedia = true;

      if (!this._isMounted) {
        this.stopStream();
      }
    } catch (err) {
      console.log("Error occured", err);
    }
  }

  preProcessScreenshotArea() {
    const cs: ScreenshotArea = JSON.parse(this.screenshotArea);

    function isSizeOutBoundary(origin: number, length: number) {
      return origin + length > 100;
    }

    if (isSizeOutBoundary(cs.x, cs.width)) {
      cs.width = 100 - cs.x;
    }

    if (isSizeOutBoundary(cs.y, cs.height)) {
      cs.height = 100 - cs.y;
    }

    return cs;
  }

  stopStream() {
    this._stream?.getTracks().forEach((track) => {
      this._stream?.removeTrack(track);
      track.stop();
    });
  }

  async screenshot() {
    return getScreenshot({
      ref: this.videoEl,
      width: this.width,
      height: this.height,
      mirrored: this.mirrored,
      screenshotArea: this._screenshotAreaObj,
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
        ${this.userMediaError()} ${this.userMedia()} ${this.screenshotOverlay()}
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

  screenshotOverlay() {
    if (!this._screenshotAreaObj?.enableOverlay) return html``;

    return html`
      <div
        class="absolute border border-dashed border-red-500"
        style="top: ${this._screenshotAreaObj?.y}%; left: ${this
          ._screenshotAreaObj?.x}%; width: ${this._screenshotAreaObj
          ?.width}%; height: ${this._screenshotAreaObj?.height}%"
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-webcam": Webcam;
  }
}

export interface ScreenshotArea {
  x: number;
  y: number;
  width: number;
  height: number;
  enableOverlay?: boolean;
}
