import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { TailwindElement } from "./tailwind.element";
import "./success";
import "./failure";

import POWERED_BY_DARK from "../assets/images/powered_by_dark.png";
import { ON_RETRY } from "../constants";

@customElement("glair-result")
export class Result extends TailwindElement {
  @property({ type: String })
  show = "";

  @property({ type: String })
  successUrl = "";

  @property({ type: String })
  cancelUrl = "";

  connectedCallback() {
    super.connectedCallback();

    // Result Event Listener to Change Show State
    window.addEventListener(ON_RETRY, () => {
      this.show = "";
    });
  }

  render() {
    return this.show === "success" || this.show === "failure"
      ? html`
          <div class="mt-6 flex h-full flex-col">
            ${this.show === "success"
              ? html` <slot name="success"
                  ><glair-success-view
                    title="Liveness Verification Successful"
                    message="Successfully verified as a real person"
                    successUrl=${this.successUrl}
                  ></glair-success-view
                ></slot>`
              : html` <slot name="failure"
                  ><glair-failure-view
                    title="Liveness Verification Failed"
                    message="Cannot identified as a real person"
                    cancel=${this.cancelUrl}
                /></slot>`}
            <slot name="footer">
              <div class="mb-6 flex h-full flex-col justify-end self-center">
                <img
                  src=${POWERED_BY_DARK}
                  height=${200}
                  width=${200}
                  alt="pwrd_by_glair_d"
                />
              </div>
            </slot>
          </div>
        `
      : html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-result": Result;
  }
}
