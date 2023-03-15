import { TailwindElement } from "../shared/tailwind.element";
import "./liveness-hint";
export declare class PassiveLiveness extends TailwindElement {
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "passive-liveness": PassiveLiveness;
    }
}
