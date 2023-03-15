import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { TailwindElement } from "../shared/tailwind.element";

@customElement("loading-dots")
export class LoadingDots extends TailwindElement {
  render() {
    return html`
      <div class="loading-dots relative mt-2 block h-5 w-20">
        <div class="absolute top-0 mt-1 h-3 w-3 rounded-full bg-white"></div>
        <div class="absolute top-0 mt-1 h-3 w-3 rounded-full bg-white"></div>
        <div class="absolute top-0 mt-1 h-3 w-3 rounded-full bg-white"></div>
        <div class="absolute top-0 mt-1 h-3 w-3 rounded-full bg-white"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "loading-dots": LoadingDots;
  }
}
