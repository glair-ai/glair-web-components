import { TailwindElement } from "../shared/tailwind.element";
export declare class LoadingSpinner extends TailwindElement {
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "loading-spinner": LoadingSpinner;
    }
}
