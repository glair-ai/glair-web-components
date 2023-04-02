import { ReactiveControllerHost } from "lit";

export class ResizeController {
  private static readonly MIN_FRAMESIZE = 480;
  private host: ReactiveControllerHost;
  frameSize = 0;

  _onResize = () => {
    this.frameSize = Math.min(
      window.innerHeight,
      window.innerWidth,
      ResizeController.MIN_FRAMESIZE
    );
    console.log(this.frameSize);
    this.host.requestUpdate();
  };

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.frameSize = Math.min(
      window.innerHeight,
      window.innerWidth,
      ResizeController.MIN_FRAMESIZE
    );
    host.addController(this);
  }

  hostConnected() {
    // https://stackoverflow.com/questions/64535078/lit-element-event-listener-doesnt-force-re-render
    // If we call addEventListener directly on @customEomponent, it will not be called. See the above link for detail.
    window.addEventListener("resize", this._onResize);
  }

  hostDisconnected() {
    window.removeEventListener("resize", this._onResize);
  }
}
