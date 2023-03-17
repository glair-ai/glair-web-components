import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ref, createRef } from "lit/directives/ref.js";

import { TailwindElement } from "./tailwind.element";

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

  @property({ type: Number, attribute: "width" })
  width = 480;
  @property({ type: Number, attribute: "height" })
  height = 480;
  @property({ type: String })
  facingMode = "user";

  async connectedCallback() {
    super.connectedCallback();
    if (!hasGetUserMedia()) {
      this.dispatch("onUserMediaError", {
        error: errorConstants.NOT_SUPPORTED,
      });
      return;
    }

    if (!this.hasMedia) {
      await this.requestUserMedia();
    }
  }

  async updated(changedProps: any) {
    // super.updated(_changedProperties);
    if (
      changedProps.has("videoContrainst") ||
      changedProps.has("audioConstraints") ||
      changedProps.has("audio")
    ) {
      await this.requestUserMedia();
    }

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
    this.dispatch("onUserMedia", stream);
  }

  /** @param {MediaStream} stream */
  static stopMediaStream(stream: any) {
    if (stream) {
      if (stream.getVideoTracks && stream.getAudioTracks) {
        stream
          .getVideoTracks()
          .map((track: { stop: () => any }) => track.stop());
        stream
          .getAudioTracks()
          .map((track: { stop: () => any }) => track.stop());
      } else {
        stream.stop();
      }
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
      <div
        class="${classMap({
          wrapper: true,
          loading: this.loading,
        })}"
        style="${`width: ${this.width}px; height: ${this.height}px`}"
      >
        <video ${ref(this.videoEl)} autoplay muted playsinline></video>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-webcam": Webcam;
  }
}

const errorConstants = {
  NOT_SUPPORTED: "NOT_SUPPORTED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  NOT_READABLE: "NOT_READABLE",
  NOT_FOUND: "NOT_FOUND",
  DEFAULT_ERROR: "DEFAULT_ERROR",
};

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
