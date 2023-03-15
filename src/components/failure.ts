import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TailwindElement } from "../shared/tailwind.element";

import FAILURE from "../assets/images/failure.png";

@customElement("failure-view")
export class Failure extends TailwindElement {
  @property({ type: String })
  title = "Verification Failed";

  @property({ type: String })
  message = "";

  @property({ type: Function })
  retry = () => {};

  @property({ type: Function })
  cancel = () => {};

  render() {
    return html`
      <div class="flex flex-col items-center gap-8">
        <h3>${this.title}</h3>
        <img
          class="mt-4"
          src=${FAILURE}
          height=${200}
          width=${200}
          alt="failure"
        />
        <p class="text-[#F60000]">${this.message}</p>
        <div class="flex w-full flex-col items-center gap-2">
          <button class="btn" onClick=${this.retry}>TRY AGAIN</button>
          <button class="btn" onClick=${this.cancel}>CANCEL</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "failure-view": Failure;
  }
}
