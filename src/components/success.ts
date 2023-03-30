import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "./tailwind.element";

import SUCCESS from "../assets/images/success.png";

@customElement("glair-success-view")
export class Success extends TailwindElement {
  @property({ type: String })
  title = "Verification Successful";

  @property({ type: String })
  message = "";

  @property({ type: String })
  successUrl = "";

  handleContinue() {
    if (!this.successUrl) return;
    location.replace(this.successUrl);
  }

  render() {
    return html`
      <div class="flex flex-col items-center gap-8">
        <h3><slot name="title">${this.title}</slot></h3>
        <slot name="icon">
          <img
            class="mt-4"
            src=${SUCCESS}
            height=${200}
            width=${200}
            alt="success"
          />
        </slot>
        <p><slot name="additional">${this.message}</slot></p>
        <button class="btn" @click=${this.handleContinue}>
          <slot name="button-text">CONTINUE</slot>
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-success-view": Success;
  }
}
