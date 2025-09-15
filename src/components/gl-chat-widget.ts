import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("gl-chat-widget")
export class GLChatWidget extends LitElement {
  // Properties
  @property({ type: String })
  url: string = "";

  @property({ type: String })
  position: "left" | "right" = "right";

  @property({ type: String })
  colorTheme: string = "#00709F";

  // Internal state
  @state()
  private widgetMode: "hidden" | "widget" | "fullScreen" = "hidden";

  @state()
  private isContracting = false;

  @state()
  private isMobile = false;

  @state()
  private viewportHeight = window.innerHeight;

  @state()
  private parentOverflow: string = "";

  // Static icons (keeping your existing icons unchanged)
  private toggleButtonMinimizedIcon = html`<svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M29.9947 15.7869H28.5346C27.9183 13.2219 25.6017 11.3142 22.8369 11.3142H16.1791C15.7513 11.3142 15.3421 11.4834 15.0393 11.7838C14.0246 12.7941 14.7434 14.5229 16.1791 14.5229H21.6649C22.8076 14.5229 23.8399 14.9876 24.5831 15.7373C25.3136 16.4724 25.7639 17.4826 25.7668 18.5969C25.7726 20.8488 23.8555 22.6903 21.5936 22.6903H10.7899C8.48992 22.6903 6.62453 20.8332 6.62453 18.5434V12.866C6.62453 10.6579 8.40691 8.85912 10.6249 8.828L18.5015 8.72008C18.9625 8.71424 19.401 8.52075 19.7165 8.1853C20.7273 7.10895 19.9645 5.351 18.4849 5.34614C15.0501 5.33447 10.5731 5.3335 10.5731 5.3335C6.55714 5.33447 3.30394 8.58979 3.30394 12.6074V12.8699H2.00597C1.26665 12.8699 0.666992 13.4669 0.666992 14.203V17.2745C0.666992 18.0106 1.26665 18.6076 2.00597 18.6076H3.30394V18.8701C3.30394 22.8877 6.55714 26.143 10.5721 26.143H21.575C24.6534 26.143 27.1956 24.2285 28.2152 21.5245H29.9947C30.734 21.5245 31.3337 20.9275 31.3337 20.1915V17.1199C31.3337 16.3839 30.734 15.7869 29.9947 15.7869Z"
      fill="white"
    />
    <path
      d="M29.9947 15.7869H28.5346C27.9183 13.2219 25.6017 11.3142 22.8369 11.3142H16.1791C15.7513 11.3142 15.3421 11.4834 15.0393 11.7838C14.0246 12.7941 14.7434 14.5229 16.1791 14.5229H21.6649C22.8076 14.5229 23.8399 14.9876 24.5831 15.7373C25.3136 16.4724 25.7639 17.4826 25.7668 18.5969C25.7726 20.8488 23.8555 22.6903 21.5936 22.6903H10.7899C8.48992 22.6903 6.62453 20.8332 6.62453 18.5434V12.866C6.62453 10.6579 8.40691 8.85912 10.6249 8.828L18.5015 8.72008C18.9625 8.71424 19.401 8.52075 19.7165 8.1853C20.7273 7.10895 19.9645 5.351 18.4849 5.34614C15.0501 5.33447 10.5731 5.3335 10.5731 5.3335C6.55714 5.33447 3.30394 8.58979 3.30394 12.6074V12.8699H2.00597C1.26665 12.8699 0.666992 13.4669 0.666992 14.203V17.2745C0.666992 18.0106 1.26665 18.6076 2.00597 18.6076H3.30394V18.8701C3.30394 22.8877 6.55714 26.143 10.5721 26.143H21.575C24.6534 26.143 27.1956 24.2285 28.2152 21.5245H29.9947C30.734 21.5245 31.3337 20.9275 31.3337 20.1915V17.1199C31.3337 16.3839 30.734 15.7869 29.9947 15.7869Z"
      fill="url(#paint0_linear_15964_22967)"
      style="mix-blend-mode: color-burn"
    />
    <path
      d="M11.4829 20.3931C12.4658 20.3931 13.2626 19.6576 13.2626 18.7503C13.2626 17.843 12.4658 17.1074 11.4829 17.1074C10.5 17.1074 9.70312 17.843 9.70312 18.7503C9.70312 19.6576 10.5 20.3931 11.4829 20.3931Z"
      fill="white"
    />
    <path
      d="M11.4829 20.3931C12.4658 20.3931 13.2626 19.6576 13.2626 18.7503C13.2626 17.843 12.4658 17.1074 11.4829 17.1074C10.5 17.1074 9.70312 17.843 9.70312 18.7503C9.70312 19.6576 10.5 20.3931 11.4829 20.3931Z"
      fill="url(#paint1_linear_15964_22967)"
      style="mix-blend-mode: color-burn"
    />
    <path
      d="M20.2446 20.3931C21.2275 20.3931 22.0244 19.6576 22.0244 18.7503C22.0244 17.843 21.2275 17.1074 20.2446 17.1074C19.2617 17.1074 18.4648 17.843 18.4648 18.7503C18.4648 19.6576 19.2617 20.3931 20.2446 20.3931Z"
      fill="white"
    />
    <path
      d="M20.2446 20.3931C21.2275 20.3931 22.0244 19.6576 22.0244 18.7503C22.0244 17.843 21.2275 17.1074 20.2446 17.1074C19.2617 17.1074 18.4648 17.843 18.4648 18.7503C18.4648 19.6576 19.2617 20.3931 20.2446 20.3931Z"
      fill="url(#paint2_linear_15964_22967)"
      style="mix-blend-mode: color-burn"
    />
    <defs>
      <linearGradient
        id="paint0_linear_15964_22967"
        x1="15.9189"
        y1="3.42596"
        x2="9.71415"
        y2="22.7762"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="white" stop-opacity="0" />
        <stop offset="1" stop-color="#CDCDCD" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_15964_22967"
        x1="11.4734"
        y1="16.8062"
        x2="10.2386"
        y2="19.6371"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="white" stop-opacity="0" />
        <stop offset="1" stop-color="#CDCDCD" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_15964_22967"
        x1="20.2352"
        y1="16.8062"
        x2="19.0004"
        y2="19.6371"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="white" stop-opacity="0" />
        <stop offset="1" stop-color="#CDCDCD" />
      </linearGradient>
    </defs>
  </svg>`;

  private fullScreenButtonIcon = html`<svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 7.5L2.5 2.5L7.5 2.5M17.5 12.5L17.5 17.5L12.5 17.5M2.5 2.5L7.91667 7.91667M17.5 17.5L12.0833 12.0833"
      stroke="#1B1B1B"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>`;

  private minimizeButtonIcon = html`<svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.5 2.5L7.5 7.5L2.5 7.5M12.5 17.5L12.5 12.5L17.5 12.5M7.5 7.5L2.08333 2.08333M12.5 12.5L17.9167 17.9167"
      stroke="#1B1B1B"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>`;

  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      --widget-desktop-width: 375px;
      --widget-desktop-height: 640px;
      --widget-mobile-width: calc(100dvw - 20px);
      --widget-mobile-height: calc(100dvh - 140px);
      --widget-mobile-max-height: 600px;
      --safe-area-bottom: env(safe-area-inset-bottom, 0px);
      --safe-area-left: env(safe-area-inset-left, 0px);
      --safe-area-right: env(safe-area-inset-right, 0px);
    }

    .chat-widget-container {
      position: fixed;
      bottom: calc(20px + var(--safe-area-bottom));
      z-index: 9999;
    }

    .chat-widget-container[data-mode="hidden"] {
      pointer-events: none;
    }

    .chat-widget-container[data-mode="widget"] {
      pointer-events: all;
    }

    .chat-widget-container[data-mode="fullScreen"] {
      pointer-events: all;
    }

    .chat-widget-container[data-position="right"] {
      right: calc(10px + var(--safe-area-right));
    }

    .chat-widget-container[data-position="left"] {
      left: calc(10px + var(--safe-area-left));
    }

    /* Fullscreen container */
    .chat-widget-container[data-fullscreen="true"] {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100dvw;
      height: 100dvh;
      z-index: 9999;
    }

    .chat-toggle-button {
      position: fixed;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      bottom: calc(20px + var(--safe-area-bottom));
      z-index: 10000;
      transition: transform 0.2s ease, background-color 0.3s ease;
    }

    .chat-toggle-button[data-position="right"] {
      right: calc(10px + var(--safe-area-right));
    }

    .chat-toggle-button[data-position="left"] {
      left: calc(10px + var(--safe-area-left));
    }

    .chat-toggle-button:hover {
      transform: scale(1.05);
    }

    .chat-widget {
      width: var(--widget-desktop-width);
      height: var(--widget-desktop-height);
      background-color: white;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.05),
        0px 10px 15px -3px rgba(0, 0, 0, 0.1),
        0px 4px 6px -2px rgba(0, 0, 0, 0.05);
      bottom: 70px;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .chat-widget[data-position="right"] {
      right: 0;
      transform-origin: bottom right;
    }

    .chat-widget[data-position="left"] {
      left: 0;
      transform-origin: bottom left;
    }

    .chat-widget[data-position="left"][data-mode="fullScreen"] {
      left: 0 !important;
      bottom: 0 !important;
    }

    .chat-widget[data-position="right"][data-mode="fullScreen"] {
      right: 0 !important;
      bottom: 0 !important;
    }

    /* Fullscreen mode */
    .chat-widget[data-mode="fullScreen"] {
      position: fixed !important;
      width: 100dvw !important;
      height: 100dvh !important;
      border-radius: 0 !important;
      max-width: none !important;
      max-height: none !important;
      transform-origin: center !important;
    }

    .chat-widget-header {
      height: 40px;
      background-color: #f8f8f8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      border-bottom: 1px solid #eaeaea;
    }

    .expand-button {
      cursor: pointer;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      background: none;
      border: none;
      padding: 2px;
      border-radius: 4px;
    }

    .expand-button:hover {
      transform: scale(1.1);
      background-color: rgba(0, 0, 0, 0.05);
    }

    .chat-iframe-container {
      width: 100%;
      height: calc(100% - 40px);
      overflow: hidden;
    }

    .chat-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Widget mode states */
    .chat-widget[data-mode="hidden"] {
      opacity: 0;
      visibility: hidden;
      transform: scale(0);
      pointer-events: none;
    }

    .chat-widget[data-mode="widget"] {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
      pointer-events: all;
    }

    .chat-toggle-button[data-hidden="true"] {
      display: none;
    }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      .chat-widget-container {
        bottom: calc(15px + var(--safe-area-bottom));
      }

      .chat-widget-container[data-position="right"] {
        right: calc(10px + var(--safe-area-right));
      }

      .chat-widget-container[data-position="left"] {
        left: calc(10px + var(--safe-area-left));
      }

      .chat-widget {
        width: var(--widget-mobile-width);
        height: var(--widget-mobile-height);
        max-width: calc(100dvw - 20px);
        max-height: calc(100dvh - 160px);
        bottom: 70px;
      }

      .chat-widget[data-position="right"] {
        right: 0;
        transform-origin: bottom center;
      }

      .chat-widget[data-position="left"] {
        left: 0;
        transform-origin: bottom center;
      }

      .chat-toggle-button {
        width: 50px;
        height: 50px;
      }

      .chat-toggle-button svg {
        width: 28px;
        height: 28px;
      }
    }

    /* Extra small mobile devices with navigation bars */
    @media (max-width: 480px) {
      .chat-widget-container {
        bottom: calc(10px + var(--safe-area-bottom));
      }

      .chat-widget-container[data-position="right"] {
        right: calc(8px + var(--safe-area-right));
      }

      .chat-widget-container[data-position="left"] {
        left: calc(8px + var(--safe-area-left));
      }

      .chat-widget {
        width: calc(100dvw - 16px);
        height: calc(100dvh - 180px);
        max-height: calc(100dvh - 120px);
        border-radius: 8px;
      }

      .chat-widget-header {
        height: 44px;
        padding: 0 10px;
      }

      .chat-iframe-container {
        height: calc(100% - 44px);
      }

      .expand-button {
        width: 24px;
        height: 24px;
        padding: 4px;
      }

      .expand-button svg {
        width: 16px;
        height: 16px;
      }

      .chat-toggle-button {
        width: 48px;
        height: 48px;
      }

      .chat-toggle-button svg {
        width: 26px;
        height: 26px;
      }
    }

    /* Landscape orientation on mobile */
    @media (max-height: 600px) and (orientation: landscape) {
      .chat-widget {
        height: calc(100dvh - 80px);
        max-height: calc(100dvh - 60px);
      }
    }

    /* Android devices with navigation bars */
    @media (max-width: 768px) and (min-height: 500px) {
      .chat-widget-container {
        bottom: calc(20px + var(--safe-area-bottom, 48px));
      }

      .chat-widget {
        max-height: calc(100dvh - 200px);
      }
    }

    /* iOS devices with home indicator */
    @supports (-webkit-touch-callout: none) {
      @media (max-width: 768px) {
        .chat-widget-container {
          bottom: calc(15px + var(--safe-area-bottom, 34px));
        }
      }
    }

    /* Devices with navigation gestures */
    @media (max-width: 768px) and (display-mode: standalone) {
      .chat-widget-container {
        bottom: calc(25px + var(--safe-area-bottom));
      }
    }

    /* Very short screens (like when keyboard is open) */
    @media (max-height: 400px) {
      .chat-widget {
        height: calc(100dvh - 100px);
        max-height: calc(100dvh - 80px);
      }

      .chat-widget-container {
        bottom: calc(8px + var(--safe-area-bottom));
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.checkIsMobile();
    this.updateViewportHeight();
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("orientationchange", this.handleOrientationChange);

    // Listen for visual viewport changes (keyboard, navigation bars)
    if ("visualViewport" in window) {
      window.visualViewport!.addEventListener(
        "resize",
        this.handleVisualViewportChange
      );
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener(
      "orientationchange",
      this.handleOrientationChange
    );

    if ("visualViewport" in window) {
      window.visualViewport!.removeEventListener(
        "resize",
        this.handleVisualViewportChange
      );
    }
  }

  private handleResize = (): void => {
    this.checkIsMobile();
    this.updateViewportHeight();
  };

  private handleOrientationChange = (): void => {
    setTimeout(() => {
      this.checkIsMobile();
      this.updateViewportHeight();
    }, 100);
  };

  private handleVisualViewportChange = (): void => {
    this.updateViewportHeight();
  };

  private updateViewportHeight(): void {
    // Use visual viewport height if available (accounts for virtual keyboard and nav bars)
    if ("visualViewport" in window) {
      this.viewportHeight = window.visualViewport!.height;
    } else {
      this.viewportHeight = (window as any).innerHeight;
    }

    // Update CSS custom property for dynamic viewport height usage
    this.style.setProperty("--actual-vh", `${this.viewportHeight}px`);
  }

  private checkIsMobile(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  // Lifecycle methods
  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has("url")) {
      this.updateIframeSource();
    }
  }

  // Methods
  private updateIframeSource(): void {
    const iframe = this.renderRoot.querySelector(
      ".chat-iframe"
    ) as HTMLIFrameElement;
    if (iframe) iframe.src = this.url;
  }

  private toggleWidget(): void {
    if (this.widgetMode === "hidden") {
      this.showWidget();
    } else {
      this.hideWidget();
    }
  }

  private showWidget(): void {
    this.isContracting = false;

    // On mobile, consider going directly to fullscreen for better UX
    if (this.isMobile) {
      this.widgetMode = "fullScreen";

      this.parentOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
    } else {
      this.widgetMode = "widget";
    }
  }

  private hideWidget(): void {
    this.isContracting = false;
    this.widgetMode = "hidden";

    if (this.isMobile) {
      document.documentElement.style.overflow = this.parentOverflow;
    }
  }

  private toggleFullscreen(): void {
    if (this.widgetMode !== "fullScreen") {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  private enterFullscreen(): void {
    this.parentOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    this.isContracting = false;
    this.widgetMode = "fullScreen";
  }

  private exitFullscreen(): void {
    this.isContracting = true;

    // Wait for animation to complete
    setTimeout(() => {
      this.isContracting = false;
      this.widgetMode = this.isMobile ? "hidden" : "widget";
      document.documentElement.style.overflow = this.parentOverflow;
    }, 300);
  }

  render() {
    // Dynamic icons
    const toggleButtonExpandedIcon = html`<svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 12L16 20L24 12"
        stroke=${this.colorTheme}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>`;

    return html`
      <div>
        <div
          class="chat-widget-container"
          data-position="${this.position}"
          data-fullscreen="${this.widgetMode === "fullScreen"}"
          data-mobile="${this.isMobile}"
          data-mode="${this.widgetMode}"
        >
          <div
            class="chat-widget"
            data-mode="${this.widgetMode}"
            data-position="${this.position}"
            data-contracting="${this.isContracting}"
            data-mobile="${this.isMobile}"
          >
            <div class="chat-widget-header">
              <div></div>
              <button class="expand-button" @click="${this.toggleFullscreen}">
                ${this.widgetMode === "fullScreen"
                  ? this.minimizeButtonIcon
                  : this.fullScreenButtonIcon}
              </button>
            </div>
            <div class="chat-iframe-container">
              <iframe
                class="chat-iframe"
                src="${this.url}"
                title="Chat Widget"
                frameborder="0"
                allowtransparency="true"
                allow="clipboard-write"
              >
              </iframe>
            </div>
          </div>
        </div>

        <button
          class="chat-toggle-button"
          data-position="${this.position}"
          data-mode="${this.widgetMode}"
          data-expanded="${this.widgetMode !== "hidden"}"
          data-hidden="${this.widgetMode === "fullScreen"}"
          @click="${this.toggleWidget}"
          style=${styleMap({
            "background-color":
              this.widgetMode !== "hidden" ? "white" : this.colorTheme,
          })}
        >
          ${this.widgetMode !== "hidden"
            ? toggleButtonExpandedIcon
            : this.toggleButtonMinimizedIcon}
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "gl-chat-widget": GLChatWidget;
  }
}
