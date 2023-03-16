import { TailwindElement } from "../shared/tailwind.element";
export declare class Success extends TailwindElement {
    title: string;
    message: string;
    redirect: () => void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "success-view": Success;
    }
}
