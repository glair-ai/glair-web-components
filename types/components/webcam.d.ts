import { TailwindElement } from "../shared/tailwind.element.js";
export declare class Webcam extends TailwindElement {
    audio: boolean;
    audioConstraints: {};
    videoConstraints: {};
    hasMedia: boolean;
    stream: MediaStream | undefined;
    videoEl: HTMLVideoElement;
    ownStream: boolean;
    loading: boolean;
    width: number;
    height: number;
    label: string;
    controls: boolean;
    src: string;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    connectedCallback(): Promise<void>;
    updated(changedProps: any): Promise<void>;
    requestUserMedia(): Promise<void>;
    /** @param {MediaStream} stream */
    handleUserMedia(stream: MediaStream): void;
    getScreenshot(): string;
    getCanvas(): HTMLCanvasElement;
    /** @param {Error} err */
    handleError(err: any): void;
    /** @param {MediaStream} stream */
    static stopMediaStream(stream: any): void;
    /**
     * @param {String} eventName
     * @param {Object} payload
     */
    dispatch(eventName: any, payload?: {}): void;
    /** @returns {Boolean} */
    get microphoneMuted(): boolean;
    /** @returns {Boolean} */
    get videoMuted(): boolean;
    toggleMicrophoneMute(): void;
    toggleVideoMute(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "webcam-gdp": Webcam;
    }
}
