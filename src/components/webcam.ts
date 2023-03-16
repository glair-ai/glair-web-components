// @ts-nocheck
import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ref, createRef } from "lit/directives/ref.js";

import { TailwindElement } from "../shared/tailwind.element.js";

@customElement("webcam-gdp")
export class Webcam extends TailwindElement {
  @property({ type: Boolean, attribute: "audio", reflect: true })
  audio = false;
  @property({ type: Object })
  audioConstraints = {};
  @property({ type: Object })
  videoConstraints = {};
  @property({ type: Boolean, reflect: true })
  hasMedia = false;
  @property({ type: MediaStream })
  stream: MediaStream | undefined = undefined;
  @property({ type: Object, state: true })
  videoEl: HTMLVideoElement = createRef();
  @property({ type: Boolean, attribute: "own-stream" })
  ownStream = false;
  @property({ type: Boolean, state: true })
  loading = true;
  @property({ type: Number, attribute: "width" })
  width = 640;
  @property({ type: Number, attribute: "height" })
  height = 480;
  @property({ type: String, attribute: "label" })
  label = "";
  @property({ type: Boolean, attribute: "controls" })
  controls = false;

  @state()
  src = "";
  @state()
  ctx: CanvasRenderingContext2D = null;
  @state()
  canvas: HTMLCanvasElement = null;

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
      if (this.stream !== undefined) this.handleUserMedia(this.stream);
      return;
    }

    const constraints: { video: object; audio: object | undefined } = {
      video:
        typeof this.videoConstraints !== "undefined"
          ? this.videoConstraints
          : true,
      audio: undefined,
    };

    if (this.audio) {
      constraints.audio =
        typeof this.audioConstraints !== "undefined"
          ? this.audioConstraints
          : true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.handleUserMedia(stream);
    } catch (err) {
      this.handleError(err);
    }
  }

  /** @param {MediaStream} stream */

  handleUserMedia(stream: MediaStream) {
    this.stream = stream;

    try {
      if (this.videoEl?.value) {
        const videoEl = this.videoEl.value;
        videoEl.srcObject = stream;
        // console.log("a", this.getScreenshot());
        console.log("a", stream);
      }
      this.hasMedia = true;
    } catch (error) {
      this.hasMedia = true;
      this.src = window.URL.createObjectURL(stream);
      // console.log("A", window.URL.createObjectURL(stream));
    }
    this.dispatch("onUserMedia", stream);
  }

  getScreenshot() {
    console.log("getScreenshot init");
    const canvas = this.getCanvas();
    return canvas && canvas.toDataURL("image/jpeg", 0.92);
  }

  getCanvas() {
    console.log("getCanvas init");
    if (!this.ctx) {
      let canvasWidth = 480;
      let canvasHeight = 480;

      const aspectRatio = canvasWidth / canvasHeight;

      canvasWidth = 480;
      canvasHeight = canvasWidth / aspectRatio;

      this.canvas = document.createElement("canvas");
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
      this.ctx = this.canvas.getContext("2d");
    }

    const { ctx, canvas } = this;

    console.log("getCanvas draw");

    if (ctx && canvas) {
      ctx.drawImage(this.videoEl.srcObject, 0, 0, canvas.width, canvas.height);
    }

    console.log("getCanvas done draw");

    return canvas;
  }

  /** @param {Error} err */

  handleError(err) {
    console.debug(err);
    this.hasMedia = false;
    this.dispatchEvent("onUserMediaError", extractError(err));

    return;
  }

  /** @param {MediaStream} stream */

  static stopMediaStream(stream) {
    if (stream) {
      if (stream.getVideoTracks && stream.getAudioTracks) {
        stream.getVideoTracks().map((track) => track.stop());
        stream.getAudioTracks().map((track) => track.stop());
      } else {
        stream.stop();
      }
    }
  }

  /**
   * @param {String} eventName
   * @param {Object} payload
   */

  dispatch(eventName, payload = {}) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { payload },
        composed: true,
        bubbles: true,
      })
    );
  }

  /** @returns {Boolean} */

  get microphoneMuted() {
    if (this.stream) {
      if (this.stream.getAudioTracks()[0]) {
        return !this.stream.getAudioTracks()[0].enabled;
      }
    }
    return true;
  }

  /** @returns {Boolean} */

  get videoMuted() {
    if (this.stream) {
      if (this.stream.getVideoTracks()[0]) {
        return !this.stream.getVideoTracks()[0].enabled;
      }
    }
    return true;
  }

  toggleMicrophoneMute() {
    if (this.stream) {
      if (this.stream.getAudioTracks()[0]) {
        this.stream.getAudioTracks()[0].enabled =
          !this.stream.getAudioTracks()[0].enabled;
        this.dispatch("microphone-mute", {
          enabled: this.stream.getAudioTracks()[0].enabled,
        });
        console.log("muted");
        this.requestUpdate("microphoneMuted");
      } else {
        this.dispatch("request-microphone");
      }
    }
  }

  toggleVideoMute() {
    if (this.stream) {
      if (this.stream.getVideoTracks()[0]) {
        this.stream.getVideoTracks()[0].enabled =
          !this.stream.getVideoTracks()[0].enabled;
        this.dispatch("video-mute", {
          enabled: this.stream.getVideoTracks()[0].enabled,
        });
        this.requestUpdate("videoMuted");
      }
    }
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
          "video-muted": this.videoMuted,
          loading: this.loading,
        })}"
        style="${`width: ${this.width}px; height: ${this.height}px`}"
      >
        <video
          ${ref(this.videoEl)}
          autoplay
          src="${this.src}"
          muted
          playsinline
        ></video>
      </div>
      <button @click=${this.getScreenshot}>ClickMe</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "webcam-gdp": Webcam;
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

function extractError(err) {
  let error;
  const strErr = err.toString();
  if (strErr.match(/Permission/) || strErr.match(/NotAllowedError/)) {
    error = errorConstants.PERMISSION_DENIED;
  } else if (strErr.match(/notSupported/)) {
    error = errorConstants.NOT_SUPPORTED;
  } else if (strErr.match(/NotReadableError/)) {
    error = errorConstants.NOT_READABLE;
  } else if (strErr.match(/NotFoundError/)) {
    error = errorConstants.NOT_FOUND;
  } else {
    error = errorConstants.DEFAULT_ERROR;
  }

  return error;
}
