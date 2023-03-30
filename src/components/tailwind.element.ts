import { LitElement, unsafeCSS } from "lit";
import style from "../tailwind.global.css?inline";

const tailwindElement = unsafeCSS(style);

export class TailwindElement extends LitElement {
  static styles = [tailwindElement];

  dispatch(eventName: string, payload?: any) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: payload,
        composed: true,
        bubbles: true,
      })
    );
  }
}
