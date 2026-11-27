import {
  createBridge,
  getBridge,
  setDefaultBridge,
  type GLChatHostBridge,
} from "./bridge";
import type {
  GLChatContext,
  GLChatError,
  GLChatEventHandler,
  GLChatEventName,
  GLChatIdentity,
  GLChatInitOptions,
} from "./types";

/** API bound to one target. `GLChat.init()` returns one of these per iframe,
 * so several bare iframes can coexist on the same page. */
export interface GLChatInstance {
  setIdentity(
    token: string | GLChatIdentity,
    organization?: string,
  ): GLChatInstance;
  logout(): GLChatInstance;
  setContext(context: GLChatContext): GLChatInstance;
  updateContext(patch: Partial<GLChatContext>): GLChatInstance;
  clearContext(): GLChatInstance;
  on(event: GLChatEventName, handler: GLChatEventHandler): GLChatInstance;
  off(event: GLChatEventName, handler: GLChatEventHandler): GLChatInstance;
  open(): GLChatInstance;
  close(): GLChatInstance;
  toggle(): GLChatInstance;
  onLoad: (() => void) | null;
  onError: ((error: GLChatError) => void) | null;
}

/** Global facade. Convenience methods target the default bridge (the first
 * web component, or the most recent `init()` call). */
export interface GLChatGlobal extends GLChatInstance {
  init(options?: GLChatInitOptions): GLChatInstance;
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

function control(
  method: "open" | "close" | "toggle",
  bridge: GLChatHostBridge,
): void {
  const element = document.querySelector(
    "gl-chat-widget, gl-chat-sidebar",
  ) as ControlElement | null;
  if (typeof element?.[method] === "function") {
    element[method]?.();
    return;
  }
  const message =
    `${method}() requires <gl-chat-widget> or <gl-chat-sidebar> on the page. ` +
    `A bare iframe has no widget UI to open, close or toggle.`;
  console.warn(`[GLChat] ${message}`);
  bridge.emitError("widget_unavailable", message);
}

/** Install the same methods on a global facade or on an instance returned by
 * `init()`. `bridgeFor` is resolved at call time so the global follows the
 * default bridge after another `init()`. */
function defineFacade<T extends object>(
  target: T,
  bridgeFor: () => GLChatHostBridge,
): T {
  const methods = {
    setIdentity: (token: string | GLChatIdentity, organization?: string) => {
      bridgeFor().setIdentity(token, organization);
      return target;
    },
    logout: () => {
      bridgeFor().logout();
      return target;
    },
    setContext: (context: GLChatContext) => {
      bridgeFor().setContext(context);
      return target;
    },
    updateContext: (patch: Partial<GLChatContext>) => {
      bridgeFor().updateContext(patch);
      return target;
    },
    clearContext: () => {
      bridgeFor().clearContext();
      return target;
    },
    on: (event: GLChatEventName, handler: GLChatEventHandler) => {
      bridgeFor().on(event, handler);
      return target;
    },
    off: (event: GLChatEventName, handler: GLChatEventHandler) => {
      bridgeFor().off(event, handler);
      return target;
    },
    open: () => {
      control("open", bridgeFor());
      return target;
    },
    close: () => {
      control("close", bridgeFor());
      return target;
    },
    toggle: () => {
      control("toggle", bridgeFor());
      return target;
    },
  };

  Object.assign(target, methods);
  Object.defineProperty(target, "onLoad", {
    configurable: true,
    get: () => bridgeFor().getLoadHandler(),
    set: (handler: (() => void) | null) => bridgeFor().setLoadHandler(handler),
  });
  Object.defineProperty(target, "onError", {
    configurable: true,
    get: () => bridgeFor().getErrorHandler(),
    set: (handler: ((error: GLChatError) => void) | null) =>
      bridgeFor().setErrorHandler(handler),
  });
  return target;
}

/**
 * Install (or augment) `window.GLChat`.
 *
 * A host can set `window.GLChat = window.GLChat || {}` and assign `onLoad` /
 * `onError` before this script loads; those handlers are preserved.
 */
export function installGLChatGlobal(): GLChatGlobal {
  const win = window as unknown as { GLChat?: GLChatGlobal };
  const existing = (win.GLChat ?? {}) as GLChatGlobal;
  const marker = Symbol.for("glair.gl-chat-widget.sdk.installed");

  if ((existing as unknown as Record<symbol, boolean>)[marker]) {
    return existing;
  }

  const preexistingLoad = existing.onLoad;
  const preexistingError = existing.onError;

  existing.init = (options) => {
    // Each call gets its own bridge, so multiple bare iframes are independent.
    const instance = createBridge(options);
    setDefaultBridge(instance);
    return defineFacade({}, () => instance) as GLChatInstance;
  };

  defineFacade(existing, getBridge);

  Object.defineProperty(existing, "version", {
    configurable: true,
    enumerable: true,
    value: "1.0.0",
  });
  Object.defineProperty(existing, marker, { value: true });

  win.GLChat = existing;

  const defaultBridge = getBridge();
  defaultBridge.init();
  if (typeof preexistingLoad === "function") {
    defaultBridge.setLoadHandler(preexistingLoad);
  }
  if (typeof preexistingError === "function") {
    defaultBridge.setErrorHandler(preexistingError);
  }

  return existing;
}
