import { html } from "lit";
import { customElement, state } from "lit/decorators.js";

import { TailwindElement } from "../shared/tailwind.element";
import "./liveness-hint";
import "./camera-blocked";
import "./please-wait";
import "./success";
import "./failure";
import "./loading-dots";
import "./webcam";

import OVERLAY from "../assets/images/passive_overlay.png";
import IC_BACK_BTN from "../assets/icon/ic_back_btn.svg";
import IC_CAMERA_BTN from "../assets/icon/ic_camera_btn.svg";
import POWERED_BY_DARK from "../assets/images/powered_by_dark.png";
import POWERED_BY_WHITE from "../assets/images/powered_by_white.png";

const MAX_FRAME_SIZE = 480;

@customElement("passive-liveness")
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
  protected isCameraAllowed = true;
  setIsCameraAllowed(value: boolean) {
    this.isCameraAllowed = value;
  }

  @state()
  protected cameraOn = false;
  setCameraOn(value: boolean) {
    this.cameraOn = value;
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
          this.setCameraOn(true);
          this.setImage({ name: "camera", url: "" });
        }
      })
      .catch(() => {
        this.setIsCameraAllowed(false);
      });
  }

  async handleOnSubmit() {
    this.setLoading(true);

    // const screenshot = webcam.current?.getScreenshot() || "";
    // let fetchScreenshot;
    // if (screenshot) {
    //   this.setImage({ ...this.image, url: screenshot });
    //   this.setCameraOn(false);
    //   fetchScreenshot = await fetch(screenshot);
    // } else {
    //   fetchScreenshot = await fetch(this.image.url);
    // }

    // const formData = new FormData();
    // formData.append("image", await fetchScreenshot.blob(), "image");
    // formData.append("sid", sid as string);

    // const response = await fetch("/api/passive-liveness", {
    //   method: "POST",
    //   body: formData,
    // });

    // const result: PassiveLivenessResult = await response.json();
    // if (!result.result) {
    //   this.setSuccess(false);
    //   this.setLoading(false);
    //   console.log("error:", result);
    //   return;
    // }
    // this.setSuccess(result.status === "success" ? true : false);
    this.setSuccess(true);

    const sleep = () => new Promise((resolve) => setTimeout(resolve, 500));
    await sleep();

    this.setLoading(false);
    // console.log(result);
  }

  handleSuccess() {
    // if (!successUrl) return;
    // router.push(successUrl);
  }

  handleFailure() {
    this.setCameraOn(true);
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
          ? html`<success-view
              title="Liveness Verification Successful"
              message="Successfully verified as a real person"
              redirect=${this.handleSuccess}
            ></success-view>`
          : html` <failure-view
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
    const url = this.image.url;
    const isCameraAllowed = this.isCameraAllowed;
    const loading = this.loading;

    function camera() {
      // <lit-webcam
      //   height=${Math.max(frameSize, MAX_FRAME_SIZE)}
      //   width=${frameSize}
      //   class="bg-black"
      //   .videoConstraints="${{
      //     height: Math.max(frameSize, MAX_FRAME_SIZE),
      //     width: frameSize,
      //     facingMode: "user",
      //   }}"
      // ></lit-webcam>
      return html`
        <webcam-gdp
          class="bg-gray-500"
          width=${480}
          height=${480}
          .videoConstraints="${{
            height: Math.max(frameSize, MAX_FRAME_SIZE),
            width: frameSize,
            facingMode: "user",
          }}"
        ></webcam-gdp>
        <div class="absolute top-[15%] left-[0%] mx-16 my-auto">
          <img
            src=${OVERLAY}
            height="${frameSize}"
            width="${frameSize}"
            alt="overlay"
          />
        </div>
      `;
    }

    function image() {
      return html`
        <img
          src=${url}
          height=${frameSize}
          width=${frameSize}
          alt="Photo"
          class="${url ? "visible" : "invisible"}"
        />
      `;
    }

    return html`
      <div class="relative">
        ${this.cameraOn ? camera() : image()}
        <div class="absolute top-[40%] left-[50%] translate-x-[-50%]">
          ${!isCameraAllowed ? html`<camera-blocked></camera-blocked>` : ""}
          ${loading ? html`<please-wait></please-wait>` : ""}
        </div>
        <div class="absolute top-[2%] left-[2%]">
          <img
            class="cursor-pointer"
            src=${IC_BACK_BTN}
            height=${40}
            width=${40}
            alt="ic_back"
          />
        </div>
      </div>
    `;
  }

  InstructionView() {
    const loading = this.loading;
    const handleOnSubmit = this.handleOnSubmit;

    function Loading() {
      return html`
        <loading-dots></loading-dots>
        <p class="text-white">Verification is in progress</p>
      `;
    }

    function Instruction() {
      return html`
        <div class="flex flex-col items-center gap-1">
          <p class="text-[18px] font-bold text-white">Take photo</p>
          <img
            class="cursor-pointer"
            src=${IC_CAMERA_BTN}
            height=${50}
            width=${50}
            alt="ic_camera"
            @click=${handleOnSubmit}
          />
        </div>
        <p class="mx-8 text-center text-white">
          Make sure your face is clearly visible on the marked area
        </p>
      `;
    }

    return html`
      <div
        class="z-9 -mt-6 flex min-h-[175px] w-full flex-1 basis-auto flex-col items-center gap-4 rounded-t-3xl bg-[#121212] py-6 lg:mt-0 lg:rounded-none"
      >
        ${loading ? Loading() : Instruction()}
        <div class="mt-6 block lg:hidden">
          <img
            src=${POWERED_BY_WHITE}
            height=${150}
            width=${150}
            alt="pwrd_by_glair_w"
          />
        </div>
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
      <!-- <liveness-hint></liveness-hint> -->
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
                ${this.FooterView()}
              </div>`
            : html` ${this.ResultView()} `}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "passive-liveness": PassiveLiveness;
  }
}
