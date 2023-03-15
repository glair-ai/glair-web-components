import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "../shared/tailwind.element";

import SUCCESS from "../assets/images/success.png";

@customElement("success-view")
export class Success extends TailwindElement {
  @property({ type: String })
  title = "Verification Successful";

  @property({ type: String })
  message = "";

  @property({ type: Function })
  redirect = () => {};

  render() {
    return html`
      <div class="flex flex-col items-center gap-8">
        <h3>${this.title}</h3>
        <img
          class="mt-4"
          src=${SUCCESS}
          height=${200}
          width=${200}
          alt="success"
        />
        <p>${this.message}</p>
        <button class="btn" onClick=${this.redirect}>CONTINUE</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "success-view": Success;
  }
}
