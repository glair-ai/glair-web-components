import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "./tailwind.element";

import "./loading-spinner";

@customElement("glair-please-wait")
export class PleaseWait extends TailwindElement {
  @property({ type: String })
  label = "Please wait";

  render() {
    return html`
      <div
        class="flex flex-row items-center rounded-sm border bg-white py-4 px-8"
      >
        <glair-loading-spinner></glair-loading-spinner>
        <p class="ml-2 text-center">${this.label}</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-please-wait": PleaseWait;
  }
}
