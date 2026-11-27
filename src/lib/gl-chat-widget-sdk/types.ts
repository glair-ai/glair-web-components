/**
 * Public types for the GLChat host SDK (tawk.to-style `window.GLChat` API).
 *
 * The wire format is deliberately kept private to the SDK: host pages only
 * deal with methods and events, never with `postMessage` payloads.
 */

/** Shape accepted by `setContext`. Unknown fields are allowed so existing host
 * integrations (e.g. `{ company: { id } }`) keep working. */
export interface GLChatContext {
  page?: {
    url?: string;
    title?: string;
    route?: string;
    [key: string]: unknown;
  };
  entities?: Array<{ type: string; id: string; label?: string }>;
  filters?: Record<string, string | number>;
  extra?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Identity payload forwarded to GLChat's existing partner-SSO (`auth-idp`) flow. */
export interface GLChatIdentity {
  token: string;
  organization: string;
}

export type GLChatErrorCode =
  | "widget_unavailable"
  | "origin_untrusted"
  | "invalid_payload";

export interface GLChatError {
  code: GLChatErrorCode;
  message: string;
  detail?: unknown;
}

/** Events observable by the host through `GLChat.on(event, handler)`. */
export type GLChatEventName =
  | "ready"
  | "authReady"
  | "contextReady"
  | "logoutDone"
  | "error";

export type GLChatEventHandler = (detail?: unknown) => void;

export interface GLChatInitOptions {
  /** Explicit iframe to talk to. Useful when the host embeds the iframe
   * directly (NUI) instead of using `<gl-chat-widget>`. */
  iframe?: HTMLIFrameElement | null;
  /** Selector for a bare iframe when no GLChat web component is present. */
  iframeSelector?: string;
  /** Override the target origin. Defaults to the iframe `src` origin. */
  origin?: string;
  /** Convenience equivalent of assigning `GLChat.onLoad`. */
  onLoad?: () => void;
  /** Convenience equivalent of assigning `GLChat.onError`. */
  onError?: (error: GLChatError) => void;
}
