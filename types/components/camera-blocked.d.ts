import { TailwindElement } from "../shared/tailwind.element";
export declare class CameraBlocked extends TailwindElement {
    protected dismissed: boolean;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "camera-blocked": CameraBlocked;
    }
}
