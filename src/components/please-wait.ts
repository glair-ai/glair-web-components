import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "../shared/tailwind.element";

import "./loading-spinner";

@customElement("please-wait")
export class PleaseWait extends TailwindElement {
  @property({ type: String })
  label = "Please wait";

  render() {
    return html`
      <div
        class="flex flex-row items-center rounded-sm border bg-white py-4 px-8"
      >
        <loading-spinner></loading-spinner>
        <p class="ml-2 text-center">${this.label}</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "please-wait": PleaseWait;
  }
}
