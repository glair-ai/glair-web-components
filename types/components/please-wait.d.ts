import { TailwindElement } from "../shared/tailwind.element";
import "./loading-spinner";
export declare class PleaseWait extends TailwindElement {
    label: string;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "please-wait": PleaseWait;
    }
}
