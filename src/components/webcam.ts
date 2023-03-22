import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ref, createRef } from "lit/directives/ref.js";

import { TailwindElement } from "./tailwind.element";
import OVERLAY from "../assets/images/passive_overlay.png";

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
  @property({ type: Boolean, state: true })
  loading = true;
  @property({ type: Boolean })
  mirrored = false;

  @property({ type: Number, attribute: "width" })
  width = 480;
  @property({ type: Number, attribute: "height" })
  height = 480;
  @property({ type: String })
  facingMode = "user";

  async connectedCallback() {
    super.connectedCallback();

    await this.requestUserMedia();
  }

  async updated(changedProps: any) {
    if (changedProps.has("stream")) {
      if (this.stream) {
        setTimeout(() => {
          this.loading = false;
        }, 1500);
      }
    }
  }

  async requestUserMedia() {
    if (this.ownStream) {
      if (this.stream !== null) this.handleUserMedia(this.stream);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: this.width,
          height: this.height,
          facingMode: this.facingMode,
        },
      });
      this.handleUserMedia(stream);
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

  /**
   * @param {String} eventName
   * @param {Object} payload
   */
  dispatch(eventName: string, payload: object = {}) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { payload },
        composed: true,
        bubbles: true,
      })
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    Webcam.stopMediaStream(this.stream);
  }

  render() {
    return html`
      <div class="relative">
        <div
          class="${classMap({
            wrapper: true,
            loading: this.loading,
          })}"
          style="${`width: ${this.width}px; height: ${this.height}px`}"
        >
          <video
            ${ref(this.videoEl)}
            autoplay
            muted
            playsinline
            class="${this.mirrored ? "-scale-x-100" : ""}"
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
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-webcam": Webcam;
  }
}
