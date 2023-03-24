import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef } from "lit/directives/ref.js";

import { TailwindElement } from "./tailwind.element";
import "./liveness-hint";
import "./camera-blocked";
import "./please-wait";
import "./success";
import "./failure";
import "./loading-dots";
import "./webcam";

import IC_CAMERA_BTN from "../assets/icon/ic_camera_btn.svg";
import POWERED_BY_DARK from "../assets/images/powered_by_dark.png";
import { getScreenshot } from "../utils";

const MAX_FRAME_SIZE = 480;

@customElement("glair-passive-liveness")
export class PassiveLiveness extends TailwindElement {
  @state()
  protected frameSize = 0;
  setFrameSize(size: number) {
    this.frameSize = size;
  }

  @state()
  protected windowSize = {
    height: 0,
    width: 0,
  };
  setWindowSize(props: { height: number; width: number }) {
    const { width, height } = props;
    this.windowSize = {
      height,
      width,
    };
  }

  @state()
  protected isCameraAllowed = false;
  setIsCameraAllowed(value: boolean) {
    this.isCameraAllowed = value;
  }

  @state()
  protected image = {
    name: "",
    url: "",
  };
  setImage(props: { name: string; url: string }) {
    const { name, url } = props;
    this.image = { name, url };
  }

  @state()
  protected success: boolean | undefined = undefined;
  setSuccess(value: boolean | undefined) {
    this.success = value;
  }

  @state()
  protected loading = false;
  setLoading(value: boolean) {
    this.loading = value;
  }

  @state()
  cameraRef = createRef();

  // FUNCTIONS
  connectedCallback() {
    super.connectedCallback();

    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.handleOnCamera();

    return () => window.removeEventListener("resize", this.handleResize);
  }

  handleResize() {
    this.setFrameSize(
      Math.min(window.innerHeight, window.innerWidth, MAX_FRAME_SIZE)
    );
    this.setWindowSize({
      height: window.innerHeight,
      width: window.innerWidth,
    });
  }

  handleOnCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (stream.getVideoTracks().length > 0) {
          this.setIsCameraAllowed(true);
          this.setImage({ name: "camera", url: "" });
        }
      })
      .catch(() => {
        this.setIsCameraAllowed(false);
      });
  }

  async handleOnSubmit() {
    this.setLoading(true);

    const base64 = getScreenshot({
      ref: this.cameraRef,
      width: this.frameSize,
      height: Math.max(this.frameSize, MAX_FRAME_SIZE),
      mirrored: true,
    });
    console.log(base64.substring(0, 50));
    // const blob = await this.base64ToBlob(base64);
    // this.dispatch("onscreenshot", blob);

    // this.setSuccess(false);

    const sleep = () => new Promise((resolve) => setTimeout(resolve, 2500));
    await sleep();

    this.setLoading(false);
  }

  dispatch(eventName: any, payload = {}) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { payload },
        composed: true,
        bubbles: true,
      })
    );
  }

  async base64ToBlob(base64data: string) {
    const base64Response = await fetch(base64data);
    return await base64Response.blob();
  }

  handleSuccess() {
    // if (!successUrl) return;
    // router.push(successUrl);
  }

  handleFailure() {
    this.setImage({ name: "", url: "" });
    this.setSuccess(undefined);
  }

  handleCancel() {
    // if (!cancelUrl) return;
    // router.push(cancelUrl);
  }

  // VIEW
  ResultView() {
    return html`
      <div class="mt-6 flex h-full flex-col">
        ${this.success === true
          ? html`<glair-success-view
              title="Liveness Verification Successful"
              message="Successfully verified as a real person"
              redirect=${this.handleSuccess}
            ></glair-success-view>`
          : html` <glair-failure-view
              title="Liveness Verification Failed"
              message="Cannot identified as a real person"
              retry=${this.handleFailure}
              cancel=${this.handleCancel}
            />`}
        <div class="mb-6 flex h-full flex-col justify-end self-center">
          <img
            src=${POWERED_BY_DARK}
            height=${200}
            width=${200}
            alt="pwrd_by_glair_d"
          />
        </div>
      </div>
    `;
  }

  WebcamView() {
    const frameSize = this.frameSize;
    const isCameraAllowed = this.isCameraAllowed;
    const loading = this.loading;
    const cameraRef = this.cameraRef;

    return html`
      <div class="relative">
        <glair-webcam
          class="bg-gray-500"
          width=${frameSize}
          height=${Math.max(frameSize, MAX_FRAME_SIZE)}
          facingMode="user"
          .videoEl=${cameraRef}
          .mirrored=${true}
        ></glair-webcam>
        <div class="absolute top-[40%] left-[50%] translate-x-[-50%]">
          ${!isCameraAllowed
            ? html`<glair-camera-blocked></glair-camera-blocked>`
            : ""}
          ${loading ? html`<glair-please-wait></glair-please-wait>` : ""}
        </div>
      </div>
    `;
  }

  InstructionView() {
    const loading = this.loading;
    const handleOnSubmit = this.handleOnSubmit;

    function Loading() {
      return html`
        <glair-loading-dots></glair-loading-dots>
        <p class="text-white">Verification is in progress</p>
      `;
    }

    function Instruction() {
      return html`
        <p class="text-[18px] font-bold text-white">Take photo</p>
        <img
          class="cursor-pointer"
          src=${IC_CAMERA_BTN}
          height=${50}
          width=${50}
          alt="ic_camera"
          @click=${handleOnSubmit}
        />
        <p class="mx-8 text-center text-white">
          Make sure your face is clearly visible on the marked area
        </p>
      `;
    }

    return html`
      <div
        class="z-9 flex min-h-[175px] w-full flex-1 basis-auto flex-col items-center gap-4 rounded-t-3xl bg-[#121212] py-6 lg:rounded-none"
      >
        ${loading ? Loading() : Instruction()}
      </div>
    `;
  }

  FooterView() {
    return html`
      <div class="hidden h-full w-full bg-white lg:block">
        <div class="flex h-full flex-col items-center justify-end lg:mb-6">
          <img
            src=${POWERED_BY_DARK}
            height=${200}
            width=${200}
            alt="pwrd_by_glair_d"
          />
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <!-- <glair-liveness-hint> </glair-liveness-hint> -->
      <div class="flex justify-center">
        <div
          class="flex-start align-center flex min-h-[${this.windowSize
            .height}px] max-w-[${this.frameSize}px] flex-col"
        >
          ${this.success === undefined
            ? html` <div
                class="flex h-full flex-col items-center bg-black lg:mt-6 lg:mb-6"
              >
                ${this.WebcamView()}
                ${this.isCameraAllowed ? this.InstructionView() : ""}
              </div>`
            : html` ${this.ResultView()} `}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-passive-liveness": PassiveLiveness;
  }
}
