import { TailwindElement } from "../shared/tailwind.element";
export declare class Failure extends TailwindElement {
    title: string;
    message: string;
    retry: () => void;
    cancel: () => void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "failure-view": Failure;
    }
}
