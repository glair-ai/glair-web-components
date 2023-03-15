import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TailwindElement } from "../shared/tailwind.element";
import IC_BULB from "../assets/icon/ic_bulb.svg";
import IC_CAMERA from "../assets/icon/ic_camera.svg";
import IC_FACE_MASK from "../assets/icon/ic_face_mask.svg";
import IC_PEOPLE from "../assets/icon/ic_people.svg";

@customElement("liveness-hint")
export class LivenessHint extends TailwindElement {
  @state()
  protected show = true;

  render() {
    return this.show
      ? html`
          <div class="fixed inset-0 z-10 mx-auto max-w-[400px] overflow-y-auto">
            <div
              class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0"
            >
              <div
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6"
              >
                <div class="mt-2">
                  <h3 class="text-lg font-medium leading-6">
                    To ease the verification process, please make sure
                  </h3>
                  <div class="mt-2 divide-y">
                    <icon-detail src=${IC_CAMERA}>
                      Grants camera or photo gallery access permission to your
                      browser
                    </icon-detail>
                    <icon-detail src=${IC_FACE_MASK}>
                      Do not wear masks, glasses, hats or other accessories that
                      cover your face
                    </icon-detail>
                    <icon-detail src=${IC_BULB}>
                      Take photo in a place with sufficient lighting, not too
                      dark or too bright
                    </icon-detail>
                    <icon-detail src=${IC_PEOPLE}>
                      Take photo without anyone else on the screen
                    </icon-detail>
                  </div>
                </div>
                <div class="mt-4 flex flex-col items-center">
                  <button
                    type="button"
                    class="btn-primary inline-flex w-full max-w-[200px] justify-center"
                    @click="${() => {
                      this.show = false;
                    }}"
                  >
                    START
                  </button>
                </div>
              </div>
            </div>
          </div>
        `
      : html`<span></span>`;
  }
}

@customElement("icon-detail")
class IconDetail extends TailwindElement {
  @property({ type: String })
  src = "";

  render() {
    return html`
      <div class="flex flex-row items-center gap-[20px]">
        <img src=${this.src} alt="icon" class="h-[35px] w-[35px]" />
        <p class="flex-1 py-4 text-sm text-gray-800">
          <slot></slot>
        </p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "liveness-hint": LivenessHint;
    "icon-detail": IconDetail;
  }
}
