import { TailwindElement } from "../shared/tailwind.element";
export declare class LivenessHint extends TailwindElement {
    protected show: boolean;
    render(): import("lit-html").TemplateResult<1>;
}
declare class IconDetail extends TailwindElement {
    src: string;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "liveness-hint": LivenessHint;
        "icon-detail": IconDetail;
    }
}
export {};
