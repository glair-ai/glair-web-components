import "lit-webcam";
import { TailwindElement } from "../shared/tailwind.element";
import "./liveness-hint";
import "./camera-blocked";
import "./please-wait";
import "./success";
import "./failure";
import "./loading-dots";
import "./webcam";
export declare class PassiveLiveness extends TailwindElement {
    protected frameSize: number;
    setFrameSize(size: number): void;
    protected windowSize: {
        height: number;
        width: number;
    };
    setWindowSize(props: {
        height: number;
        width: number;
    }): void;
    protected isCameraAllowed: boolean;
    setIsCameraAllowed(value: boolean): void;
    protected cameraOn: boolean;
    setCameraOn(value: boolean): void;
    protected image: {
        name: string;
        url: string;
    };
    setImage(props: {
        name: string;
        url: string;
    }): void;
    protected success: boolean | undefined;
    setSuccess(value: boolean | undefined): void;
    protected loading: boolean;
    setLoading(value: boolean): void;
    connectedCallback(): () => void;
    handleResize(): void;
    handleOnCamera(): void;
    handleOnSubmit(): Promise<void>;
    handleSuccess(): void;
    handleFailure(): void;
    handleCancel(): void;
    ResultView(): import("lit-html").TemplateResult<1>;
    WebcamView(): import("lit-html").TemplateResult<1>;
    InstructionView(): import("lit-html").TemplateResult<1>;
    FooterView(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "passive-liveness": PassiveLiveness;
    }
}
