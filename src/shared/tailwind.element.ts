import { LitElement, unsafeCSS } from "lit";
import style from "./tailwind.global.css?inline";

const tailwindElement = unsafeCSS(style);

export class TailwindElement extends LitElement {
  static styles = [tailwindElement];
}
