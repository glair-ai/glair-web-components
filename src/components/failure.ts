import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "./tailwind.element";

import FAILURE from "../assets/images/failure.png";
import { ON_RETRY } from "../constants";

@customElement("glair-failure-view")
export class Failure extends TailwindElement {
  @property({ type: String })
  title = "Verification Failed";

  @property({ type: String })
  message = "";

  @property({ type: String })
  cancelUrl = "";

  handleRetry() {
    super.dispatch(ON_RETRY);
  }

  handleCancel() {
    if (!this.cancelUrl) return;
    location.replace(this.cancelUrl);
  }

  render() {
    return html`
      <div class="flex flex-col items-center gap-8">
        <h3><slot name="title">${this.title}</slot></h3>
        <slot name="icon">
          <img
            class="mt-4"
            src=${FAILURE}
            height=${200}
            width=${200}
            alt="failure"
          />
        </slot>
        <p class="text-[#F60000]">
          <slot name="additional">${this.message}</slot>
        </p>
        <div class="flex w-full flex-col items-center gap-2">
          <button class="btn" @click=${this.handleRetry}>
            <slot name="button-retry-text">TRY AGAIN</slot>
          </button>
          <button class="btn" @click=${this.handleCancel}>
            <slot name="button-cancel-text">CANCEL</slot>
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-failure-view": Failure;
  }
}
