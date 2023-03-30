import { html } from "lit";
import { customElement } from "lit/decorators.js";

import { TailwindElement } from "./tailwind.element";
import "./liveness-hint";
import "./webcam";
import "./instruction";
import "./result";

@customElement("glair-passive-liveness")
export class PassiveLiveness extends TailwindElement {
  render() {
    return html`
      <slot name="liveness-hint">
        <glair-liveness-hint> </glair-liveness-hint>
      </slot>
      <div class="flex justify-center">
        <div class="flex-start align-center flex flex-col">
          <div
            class="flex h-full flex-col items-center bg-black lg:mt-6 lg:mb-6"
          >
            <slot name="webcam">
              <glair-webcam></glair-webcam>
            </slot>
            <slot name="instruction">
              <glair-instruction></glair-instruction>
            </slot>
          </div>
          <slot name="result"><glair-result show=""></glair-result></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "glair-passive-liveness": PassiveLiveness;
  }
}
