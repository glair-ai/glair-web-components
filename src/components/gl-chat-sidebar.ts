import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("gl-chat-sidebar")
export class GLChatSidebar extends LitElement {
  // Properties
  @property({ type: String })
  url: string = "";

  @property({ type: String })
  position: "left" | "right" = "right";

  @property({ type: Number })
  width: number = 375;

  // Internal state
  @state()
  private isOpen: boolean = false;

  // SVG icons
  private toggleButtonExpandedLeftIcon = html`<svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 24L20 16L12 8"
      stroke="#00709F"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>`;

  private toggleButtonExpandedRightIcon = html`<svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 24L12 16L20 8"
      stroke="#00709F"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>`;
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
  private closeButtonIcon = html`<svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 5L5 15M5 5L15 15"
      stroke="#1B1B1B"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg> `;

  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .sidebar-container {
      position: fixed;
      top: 0;
      z-index: 9999;
      height: 100vh;
      transition: transform 0.3s ease;
    }

    .sidebar-toggle-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: #00709f;
      border: none;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      bottom: 20px;
      z-index: 10000;
      transition: left 0.2s ease, right 0.2s ease;
    }

    .sidebar-toggle-button:hover {
      transform: scale(1.05);
    }

    .sidebar-toggle-button[data-position="right"] {
      right: 20px;
    }

    .sidebar-toggle-button[data-position="left"] {
      left: 20px;
    }

    .sidebar-toggle-button[data-expanded="true"] {
      background-color: white;
    }

    .sidebar {
      background-color: white;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    }

    .sidebar-header {
      height: 40px;
      background-color: #f8f8f8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      border-bottom: 1px solid #eaeaea;
    }

    .close-button {
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar-iframe-container {
      width: 100%;
      height: calc(100% - 40px);
      overflow: hidden;
    }

    .sidebar-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .main-content {
      transition: margin 0.3s ease;
    }
  `;

  // Lifecycle methods
  connectedCallback() {
    super.connectedCallback();
    this.adjustMainContent();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has("url")) {
      this.updateIframeSource();
    }

    if (
      changedProperties.has("isOpen") ||
      changedProperties.has("position") ||
      changedProperties.has("width")
    ) {
      this.adjustMainContent();
    }
  }

  // Methods
  private updateIframeSource(): void {
    const iframe = this.renderRoot.querySelector(
      ".sidebar-iframe"
    ) as HTMLIFrameElement;
    if (iframe) iframe.src = this.url;
  }

  private toggleSidebar(): void {
    this.isOpen = !this.isOpen;

    const toggleButton = this.renderRoot.querySelector(
      ".sidebar-toggle-button"
    ) as HTMLElement;

    if (this.position === "left") {
      toggleButton.style.left = `${(this.isOpen ? this.width : 0) + 16}px`;
    } else {
      toggleButton.style.right = `${(this.isOpen ? this.width : 0) + 16}px`;
    }
  }

  private adjustMainContent(): void {
    const mainContent = document.body;

    if (this.isOpen) {
      mainContent.style.transition = "margin 0.3s ease";
      if (this.position === "right") {
        mainContent.style.marginRight = `${this.width}px`;
      } else {
        mainContent.style.marginLeft = `${this.width}px`;
      }
    } else {
      if (this.position === "right") {
        mainContent.style.marginRight = "0";
      } else {
        mainContent.style.marginLeft = "0";
      }
    }
  }

  render() {
    const sidebarStyle = {
      width: `${this.width}px`,
      [this.position]: this.isOpen ? "0" : `-${this.width}px`,
    };

    return html`
      <div
        class="sidebar-container"
        style="${Object.entries(sidebarStyle)
          .map(([k, v]) => `${k}: ${v}`)
          .join(";")}"
      >
        <div class="sidebar">
          <div class="sidebar-header">
            <div></div>
            <div class="close-button" @click="${this.toggleSidebar}">
              ${this.closeButtonIcon}
            </div>
          </div>
          <div class="sidebar-iframe-container">
            <iframe
              class="sidebar-iframe"
              src="${this.url}"
              title="Sidebar Content"
              frameborder="0"
              allowtransparency="true"
            >
            </iframe>
          </div>
        </div>
      </div>
      <button
        class="sidebar-toggle-button"
        data-expanded="${this.isOpen}"
        data-position="${this.position}"
        @click="${this.toggleSidebar}"
      >
        ${this.isOpen
          ? this.position === "left"
            ? this.toggleButtonExpandedRightIcon
            : this.toggleButtonExpandedLeftIcon
          : this.toggleButtonMinimizedIcon}
      </button>
    `;
  }

  disconnectedCallback() {
    // Reset main content margins when component is removed
    document.body.style.marginLeft = "0";
    document.body.style.marginRight = "0";
    super.disconnectedCallback();
  }
}

// Type declaration to make TypeScript happy with the custom element
declare global {
  interface HTMLElementTagNameMap {
    "gl-chat-sidebar": GLChatSidebar;
  }
}
