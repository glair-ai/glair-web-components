import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { TailwindElement } from "./tailwind.element";

import IC_CAMERA_BTN from "../assets/icon/ic_camera_btn.svg";
import { ON_RETRY, ON_TRIGGER_SCREENSHOT } from "../constants";

import "./loading-dots";

@customElement("glair-instruction")
export class Instruction extends TailwindElement {
  @state()
  protected loading = false;
  setLoading(load: boolean) {
    this.loading = load;
  }

  connectedCallback() {
    super.connectedCallback();

    // Trigger Screenshot Event Listener to Change Loading State
    window.addEventListener(ON_TRIGGER_SCREENSHOT, async () => {
      this.setLoading(true);
    });

    // Result Event Listener to Change Show State
    window.addEventListener(ON_RETRY, () => {
      this.setLoading(false);
    });
  }

  render() {
    return html`
      <div
        class="z-9 flex min-h-[175px] w-full flex-1 basis-auto flex-col items-center gap-4 rounded-t-3xl bg-[#121212] py-6 lg:rounded-none"
      >
        ${this.loading
          ? html`
              <glair-loading-dots></glair-loading-dots>
              <p class="text-white">
                <slot name="loading-text">Verification is in progress</slot>
              </p>
            `
          : html`
              <p class="text-[18px] font-bold text-white">
                <slot name="title">Take photo</slot>
              </p>
              <img
                class="cursor-pointer"
                src=${IC_CAMERA_BTN}
                height=${50}
                width=${50}
                alt="ic_camera"
                @click=${() => {
                  super.dispatch(ON_TRIGGER_SCREENSHOT, {});
                }}
              />
              <p class="mx-8 text-center text-white">
                <slot name="additional">
                  Make sure your face is clearly visible on the marked area
                </slot>
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
