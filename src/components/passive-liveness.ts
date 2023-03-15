import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { TailwindElement } from "../shared/tailwind.element";

import "./liveness-hint";

@customElement("passive-liveness")
export class PassiveLiveness extends TailwindElement {
  render() {
    return html` <liveness-hint></liveness-hint> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "passive-liveness": PassiveLiveness;
  }
}
