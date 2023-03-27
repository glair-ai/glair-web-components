import { html } from "lit";
import { customElement, state } from "lit/decorators.js";

import { TailwindElement } from "./tailwind.element";
import "./liveness-hint";
import "./success";
import "./failure";
import "./webcam";
import "./instruction";

import POWERED_BY_DARK from "../assets/images/powered_by_dark.png";

@customElement("glair-passive-liveness")
export class PassiveLiveness extends TailwindElement {
  @state()
  protected success: boolean | undefined = undefined;
  setSuccess(value: boolean | undefined) {
    this.success = value;
  }

  // FUNCTIONS
  handleSuccess() {
    // if (!successUrl) return;
    // router.push(successUrl);
  }

  handleFailure() {
    this.setSuccess(undefined);
  }

  handleCancel() {
    // if (!cancelUrl) return;
    // router.push(cancelUrl);
  }

  // VIEW
  ResultView() {
    return html`
      <div class="mt-6 flex h-full flex-col">
        ${this.success === true
          ? html`<glair-success-view
              title="Liveness Verification Successful"
              message="Successfully verified as a real person"
              redirect=${this.handleSuccess}
            ></glair-success-view>`
          : html` <glair-failure-view
              title="Liveness Verification Failed"
              message="Cannot identified as a real person"
              retry=${this.handleFailure}
              cancel=${this.handleCancel}
            />`}
        <div class="mb-6 flex h-full flex-col justify-end self-center">
          <img
            src=${POWERED_BY_DARK}
            height=${200}
            width=${200}
            alt="pwrd_by_glair_d"
          />
        </div>
      </div>
    `;
  }

  FooterView() {
    return html`
      <div class="hidden h-full w-full bg-white lg:block">
        <div class="flex h-full flex-col items-center justify-end lg:mb-6">
          <img
            src=${POWERED_BY_DARK}
            height=${200}
            width=${200}
            alt="pwrd_by_glair_d"
          />
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <slot name="liveness-hint">
        <!-- <glair-liveness-hint> </glair-liveness-hint> -->
      </slot>
      <div class="flex justify-center">
        <div class="flex-start align-center flex flex-col">
          ${this.success === undefined
            ? html` <div
                class="flex h-full flex-col items-center bg-black lg:mt-6 lg:mb-6"
              >
                <slot name="webcam">
                  <glair-webcam></glair-webcam>
                </slot>
                <glair-instruction></glair-instruction>
              </div>`
            : html` ${this.ResultView()} `}
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
