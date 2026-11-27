import { getBridge } from "./bridge";
import type {
  GLChatContext,
  GLChatError,
  GLChatEventHandler,
  GLChatEventName,
  GLChatIdentity,
  GLChatInitOptions,
} from "./types";

/** tawk.to-style global API. Every method returns the API so calls can be
 * chained, and calls made before the widget is ready are queued. */
export interface GLChatGlobal {
  /** Bind to an explicit iframe / origin. Optional when a GLChat web
   * component is already on the page. */
  init(options?: GLChatInitOptions): GLChatGlobal;
  /** Partner SSO login (`auth-idp`). */
  setIdentity(
    token: string | GLChatIdentity,
    organization?: string,
  ): GLChatGlobal;
  /** Partner SSO logout (`logout-idp`). */
  logout(): GLChatGlobal;
  /** Replace page context (`page-context`). */
  setContext(context: GLChatContext): GLChatGlobal;
  /** Merge a patch into the current page context. */
  updateContext(patch: Partial<GLChatContext>): GLChatGlobal;
  /** Empty the page context so stale data is not reused. */
  clearContext(): GLChatGlobal;
  on(event: GLChatEventName, handler: GLChatEventHandler): GLChatGlobal;
  off(event: GLChatEventName, handler: GLChatEventHandler): GLChatGlobal;
  /** Delegate to the on-page widget, when available. */
  open(): GLChatGlobal;
  close(): GLChatGlobal;
  toggle(): GLChatGlobal;
  onLoad: (() => void) | null;
  onError: ((error: GLChatError) => void) | null;
  readonly version: string;
}

declare global {
  interface Window {
    /** Installed by `installGLChatGlobal()` / `standalone/gl-chat-widget-sdk.js`. */
    GLChat?: GLChatGlobal;
  }
}

type ControlElement = HTMLElement & {
  open?: () => void;
  close?: () => void;
  toggle?: () => void;
};

function control(method: "open" | "close" | "toggle"): void {
  const element = document.querySelector(
    "gl-chat-widget, gl-chat-sidebar",
  ) as ControlElement | null;
  if (typeof element?.[method] === "function") {
    element[method]?.();
    return;
  }
  console.warn(
    `[GLChat] ${method}() requires <gl-chat-widget> or <gl-chat-sidebar> on the page.`,
  );
}

/**
 * Install (or augment) `window.GLChat`.
 *
 * A host can set `window.GLChat = window.GLChat || {}` and assign `onLoad` /
 * `onError` before this script loads; those handlers are preserved.
 */
export function installGLChatGlobal(): GLChatGlobal {
  const win = window as unknown as { GLChat?: GLChatGlobal };
  const existing = win.GLChat ?? ({} as GLChatGlobal);
  const marker = Symbol.for("glair.gl-chat-widget.sdk.installed");

  if ((existing as unknown as Record<symbol, boolean>)[marker]) {
    return existing;
  }

  const bridge = getBridge();
  const preexistingLoad = existing.onLoad;
  const preexistingError = existing.onError;

  const methods: Omit<
    GLChatGlobal,
    "onLoad" | "onError" | "version"
  > = {
    init: (options) => {
      bridge.init(options);
      return existing;
    },
    setIdentity: (token, organization) => {
      bridge.setIdentity(token, organization);
      return existing;
    },
    logout: () => {
      bridge.logout();
      return existing;
    },
    setContext: (context) => {
      bridge.setContext(context);
      return existing;
    },
    updateContext: (patch) => {
      bridge.updateContext(patch);
      return existing;
    },
    clearContext: () => {
      bridge.clearContext();
      return existing;
    },
    on: (event, handler) => {
      bridge.on(event, handler);
      return existing;
    },
    off: (event, handler) => {
      bridge.off(event, handler);
      return existing;
    },
    open: () => {
      control("open");
      return existing;
    },
    close: () => {
      control("close");
      return existing;
    },
    toggle: () => {
      control("toggle");
      return existing;
    },
  };

  Object.assign(existing, methods);

  Object.defineProperty(existing, "onLoad", {
    configurable: true,
    get: () => bridge.getLoadHandler(),
    set: (handler: (() => void) | null) => bridge.setLoadHandler(handler),
  });
  Object.defineProperty(existing, "onError", {
    configurable: true,
    get: () => bridge.getErrorHandler(),
    set: (handler: ((error: GLChatError) => void) | null) =>
      bridge.setErrorHandler(handler),
  });
  Object.defineProperty(existing, "version", {
    configurable: true,
    enumerable: true,
    value: "1.0.0",
  });
  Object.defineProperty(existing, marker, {
    value: true,
  });

  win.GLChat = existing;
  bridge.init();

  if (typeof preexistingLoad === "function") {
    bridge.setLoadHandler(preexistingLoad);
  }
  if (typeof preexistingError === "function") {
    bridge.setErrorHandler(preexistingError);
  }

  return existing;
}
