import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { TailwindElement } from "./tailwind.element";

@customElement("glair-camera-blocked")
export class CameraBlocked extends TailwindElement {
  @state()
  protected dismissed = false;

  render() {
    return !this.dismissed
      ? html`
          <div
            class="flex w-[325px] flex-col rounded-sm border bg-white py-4 px-8"
          >
            <p class="text-[20px]">Camera blocked</p>
            <p class="my-4">
              Please allow camera access in your browser settings and try again.
            </p>
            <div class="flex flex-col items-end">
              <button
                type="button"
                class="text-md text-[#009CDE]"
                .onclick=${() => location.reload()}
              >
                Close
              </button>
            </div>
          </div>
        `
      : html`<span></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-camera-blocked": CameraBlocked;
  }
}
