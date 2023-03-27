import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { TailwindElement } from "./tailwind.element";

import IC_CAMERA_BTN from "../assets/icon/ic_camera_btn.svg";
import { ON_TRIGGER_SCREENSHOT } from "../constants";

@customElement("glair-instruction")
export class Instruction extends TailwindElement {
  @state()
  protected loading = false;
  setLoading(load: boolean) {
    this.loading = load;
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

  render() {
    return html`
      <div
        class="z-9 flex min-h-[175px] w-full flex-1 basis-auto flex-col items-center gap-4 rounded-t-3xl bg-[#121212] py-6 lg:rounded-none"
      >
        ${this.loading
          ? html`
              <glair-loading-dots></glair-loading-dots>
              <p class="text-white">Verification is in progress</p>
            `
          : html`
              <p class="text-[18px] font-bold text-white">Take photo</p>
              <img
                class="cursor-pointer"
                src=${IC_CAMERA_BTN}
                height=${50}
                width=${50}
                alt="ic_camera"
                @click=${() => {
                  this.dispatch(ON_TRIGGER_SCREENSHOT, {});
                }}
              />
              <p class="mx-8 text-center text-white">
                Make sure your face is clearly visible on the marked area
              </p>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-instruction": Instruction;
  }
}
