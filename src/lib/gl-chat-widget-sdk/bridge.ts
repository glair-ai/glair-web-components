import {
  buildMessage,
  isInboundEvent,
  isKnownEvent,
  parseMessage,
  type OutboundEvent,
} from "./protocol";
import type {
  GLChatContext,
  GLChatError,
  GLChatErrorCode,
  GLChatEventHandler,
  GLChatEventName,
  GLChatIdentity,
  GLChatInitOptions,
} from "./types";

/** The single host-side bridge shared by the `window.GLChat` global and the
 * `<gl-chat-widget>` element methods. There is one protocol, two facades. */
export class GLChatHostBridge {
  private options: GLChatInitOptions = {};
  private iframe: HTMLIFrameElement | null = null;
  private widget: HTMLElement | null = null;
  private ready = false;
  private queue: Array<() => void> = [];
  /** True when a queued `page-context` send will be flushed on ready. */
  private pendingContext = false;
  private context: GLChatContext = {};
  private handlers = new Map<GLChatEventName, Set<GLChatEventHandler>>();
  private observer: MutationObserver | null = null;
  private shadowObserver: MutationObserver | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  /** `ready` messages can arrive before Lit has rendered the iframe. */
  private pendingMessages: Array<{
    data: unknown;
    origin: string;
    source: MessageEventSource | null;
  }> = [];
  private listening = false;
  /** tawk.to's `onLoad` fires once, even when the chat page remounts. */
  private loadFired = false;
  private loadHandler: (() => void) | null = null;
  private errorHandler: ((error: GLChatError) => void) | null = null;

  /** Start listening and bind to a target. Safe to call repeatedly. */
  init(options: GLChatInitOptions = {}): void {
    if (options.onLoad) this.setLoadHandler(options.onLoad);
    if (options.onError) this.setErrorHandler(options.onError);
    this.options = { ...this.options, ...options };

    if (!this.listening && typeof window !== "undefined") {
      window.addEventListener("message", this.handleMessage);
      this.listening = true;
    }
    this.resolveTarget();
    this.watchForTarget();
  }

  /** Register the web component instance that owns the iframe. */
  setWidget(widget: HTMLElement | null): void {
    this.widget = widget;
    this.resolveTarget();
    this.watchForTarget();
  }

  /** Drop all listeners and queued calls. Mainly useful in tests / SPAs that
   * tear down the widget permanently. */
  destroy(): void {
    if (this.listening) {
      window.removeEventListener("message", this.handleMessage);
      this.listening = false;
    }
    this.stopWatching();
    this.queue = [];
    this.pendingMessages = [];
    this.pendingContext = false;
    this.ready = false;
    this.loadFired = false;
    this.widget = null;
    this.iframe = null;
  }

  // ------------------------------------------------------------------
  // Public API (shared by both facades)
  // ------------------------------------------------------------------

  setLoadHandler(handler: (() => void) | null): void {
    this.loadHandler = handler;
    // tawk.to-style: assigning onLoad after the widget is ready still fires.
    if (handler && this.ready) {
      try {
        handler();
      } catch (error) {
        this.emitError("invalid_payload", "GLChat onLoad handler threw.", error);
      }
    }
  }

  getLoadHandler(): (() => void) | null {
    return this.loadHandler;
  }

  setErrorHandler(handler: ((error: GLChatError) => void) | null): void {
    this.errorHandler = handler;
  }

  getErrorHandler(): ((error: GLChatError) => void) | null {
    return this.errorHandler;
  }

  on(event: GLChatEventName, handler: GLChatEventHandler): void {
    const set = this.handlers.get(event) ?? new Set<GLChatEventHandler>();
    set.add(handler);
    this.handlers.set(event, set);
  }

  off(event: GLChatEventName, handler: GLChatEventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  /** Partner SSO login. Mirrors `{ type: 'auth-idp', token, organization }`
   * consumed by glchat-ui's IDPPage. */
  setIdentity(
    token: string | GLChatIdentity,
    organization?: string,
  ): void {
    const identity: GLChatIdentity =
      typeof token === "string"
        ? { token, organization: organization ?? "" }
        : token;

    if (!identity || typeof identity.token !== "string" || !identity.token) {
      this.emitError(
        "invalid_payload",
        "setIdentity requires a token.",
        identity,
      );
      return;
    }
    if (!identity.organization) {
      this.emitError(
        "invalid_payload",
        "setIdentity requires an organization (partner SSO).",
        identity,
      );
      return;
    }

    this.post("auth-idp", {
      token: identity.token,
      organization: identity.organization,
    });
  }

  /** Partner SSO logout. Mirrors `{ type: 'logout-idp' }`. */
  logout(): void {
    this.post("logout-idp");
  }

  /** Replace the whole page context. Mirrors `{ type: 'page-context',
   * pageContext }` consumed by glchat-ui's PageContextListener. */
  setContext(context: GLChatContext): void {
    this.context = { ...context };
    this.post("page-context", { pageContext: this.context });
  }

  /** Merge a patch into the current context and send the full object. */
  updateContext(patch: Partial<GLChatContext>): void {
    this.context = { ...this.context, ...patch };
    this.post("page-context", { pageContext: this.context });
  }

  /** Clear the context. Sends an empty object so stale context is not reused. */
  clearContext(): void {
    this.context = {};
    this.post("page-context", { pageContext: {} });
  }

  // ------------------------------------------------------------------
  // Target resolution
  // ------------------------------------------------------------------

  private resolveTarget(): boolean {
    if (typeof document === "undefined") return false;

    let iframe = this.options.iframe ?? null;

    if (!iframe && this.widget) {
      iframe = this.widget.shadowRoot?.querySelector("iframe") ?? null;
    }

    if (!iframe) {
      const component = document.querySelector(
        "gl-chat-widget, gl-chat-sidebar",
      );
      iframe = component?.shadowRoot?.querySelector("iframe") ?? null;
    }

    if (!iframe && this.options.iframeSelector) {
      iframe = document.querySelector(this.options.iframeSelector);
    }

    if (!iframe) return false;

    if (iframe !== this.iframe) {
      this.iframe = iframe;
      // A different iframe needs a fresh handshake before queued calls are sent.
      this.ready = false;
      this.flushPendingMessages();
    }
    return true;
  }

  private getTargetOrigin(): string {
    if (this.options.origin) return this.options.origin;
    const src = this.iframe?.src;
    if (!src) return "";
    try {
      return new URL(src, window.location.href).origin;
    } catch {
      return "";
    }
  }

  /** Watch for late insertion of the component / iframe. Lit renders the
   * iframe asynchronously inside a shadow root, so a document observer alone
   * is not enough — poll briefly as well. */
  private watchForTarget(): void {
    if (typeof document === "undefined" || this.iframe) return;

    if (!this.observer) {
      this.observer = new MutationObserver(() => {
        if (this.resolveTarget()) {
          this.stopWatching();
        } else {
          this.retryCount = 0;
          this.scheduleRetry();
        }
      });
      this.observer.observe(document, { childList: true, subtree: true });
    }

    this.observeShadowRoot();
    this.scheduleRetry();
  }

  /** MutationObserver callbacks cannot see inside a shadow root, so observe
   * the web component's own render root once it exists. */
  private observeShadowRoot(): void {
    const host =
      this.widget ?? document.querySelector("gl-chat-widget, gl-chat-sidebar");
    const root = host?.shadowRoot;
    if (!root || this.shadowObserver) return;

    this.shadowObserver = new MutationObserver(() => {
      if (this.resolveTarget()) this.stopWatching();
    });
    this.shadowObserver.observe(root, { childList: true, subtree: true });
  }

  /** Bounded fallback for frameworks that render after our first check. */
  private scheduleRetry(): void {
    if (this.iframe || this.retryTimer || this.retryCount >= 20) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.retryCount += 1;
      if (this.resolveTarget()) {
        this.stopWatching();
      } else {
        this.scheduleRetry();
      }
    }, 50);
  }

  private stopWatching(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.shadowObserver?.disconnect();
    this.shadowObserver = null;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  // ------------------------------------------------------------------
  // Message handling
  // ------------------------------------------------------------------

  private handleMessage = (event: MessageEvent): void => {
    this.handleIncoming(event.data, event.origin, event.source);
  };

  private handleIncoming(
    data: unknown,
    origin: string,
    source: MessageEventSource | null,
  ): void {
    const payload = parseMessage(data);
    if (!payload || !isKnownEvent(payload.type)) return;

    const type = payload.type;
    // The chat page may signal ready before the element has rendered its
    // iframe; resolve the target first, then buffer the message if needed.
    this.resolveTarget();
    const expectedOrigin = this.getTargetOrigin();
    const iframeSource = this.iframe?.contentWindow ?? null;

    if (!iframeSource || !expectedOrigin) {
      if (this.pendingMessages.length < 10) {
        this.pendingMessages.push({ data, origin, source });
      }
      return;
    }

    if (source !== iframeSource || origin !== expectedOrigin) {
      this.emitError(
        "origin_untrusted",
        `Ignored ${type} from an unexpected source or origin.`,
        { origin },
      );
      return;
    }

    if (!isInboundEvent(type)) return;

    if (type === "auth-idp-ready") {
      this.markReady();
      this.emit("authReady");
      return;
    }

    if (type === "page-context-ready") {
      // If a `page-context` call is already queued, flushing it sends the
      // current context — no need to send the same payload twice.
      const shouldReplay = !this.pendingContext;
      this.markReady();
      this.emit("contextReady");
      // The chat page announces readiness on every mount, so replay the
      // latest context instead of relying on the host to re-send it.
      if (shouldReplay && Object.keys(this.context).length > 0) {
        this.send("page-context", { pageContext: this.context });
      }
      return;
    }

    if (type === "logout-idp-done") {
      this.emit("logoutDone");
    }
  }

  private flushPendingMessages(): void {
    const pending = this.pendingMessages.splice(0);
    // A buffered message may carry a WindowProxy from before the iframe
    // navigated. Re-validate it against the iframe's current window; the
    // origin check in handleIncoming still applies.
    const source = this.iframe?.contentWindow ?? null;
    for (const message of pending) {
      this.handleIncoming(message.data, message.origin, source);
    }
  }

  private markReady(): void {
    if (this.ready) return;
    this.ready = true;

    const queued = this.queue.splice(0);
    this.pendingContext = false;
    this.emit("ready");
    for (const send of queued) send();
    if (!this.loadFired) {
      this.loadFired = true;
      this.loadHandler?.();
    }
  }

  private post(type: OutboundEvent, payload: Record<string, unknown> = {}): void {
    const send = () => this.send(type, payload);
    this.resolveTarget();
    if (!this.ready) {
      if (type === "page-context") this.pendingContext = true;
      this.queue.push(send);
      return;
    }
    send();
  }

  private send(type: OutboundEvent, payload: Record<string, unknown>): void {
    const iframe = this.iframe;
    const origin = this.getTargetOrigin();
    if (!iframe?.contentWindow || !origin) {
      this.emitError(
        "widget_unavailable",
        "GLChat iframe is not available. Embed <gl-chat-widget> or call GLChat.init({ iframe }).",
      );
      return;
    }

    try {
      iframe.contentWindow.postMessage(buildMessage(type, payload), origin);
    } catch (error) {
      this.emitError("widget_unavailable", "Failed to post message to GLChat.", error);
    }
  }

  // ------------------------------------------------------------------
  // Events / errors
  // ------------------------------------------------------------------

  private emit(event: GLChatEventName, detail?: unknown): void {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(detail);
      } catch (error) {
        console.warn("[GLChat] event handler threw", error);
      }
    });
  }

  /** Report an SDK-level error to `onError` and `on('error')` subscribers. */
  emitError(
    code: GLChatErrorCode,
    message: string,
    detail?: unknown,
  ): void {
    const error: GLChatError = { code, message, detail };
    this.emit("error", error);
    try {
      this.errorHandler?.(error);
    } catch (handlerError) {
      console.warn("[GLChat] onError handler threw", handlerError);
    }
  }
}

let bridge: GLChatHostBridge | null = null;

/** Standalone bundles are built independently, so a module-local singleton
 * would give `window.GLChat` and the web components different bridges. Share
 * one instance per page through a well-known symbol instead. */
const BRIDGE_KEY = Symbol.for("glair.gl-chat-widget.sdk.bridge");

function sharedWindow(): Record<symbol, GLChatHostBridge | undefined> | null {
  return typeof window === "undefined"
    ? null
    : (window as unknown as Record<symbol, GLChatHostBridge | undefined>);
}

/** Returns the page-wide bridge instance. */
export function getBridge(): GLChatHostBridge {
  const win = sharedWindow();
  const existing = win?.[BRIDGE_KEY];
  if (existing) return existing;

  if (!bridge) bridge = new GLChatHostBridge();
  if (win) win[BRIDGE_KEY] = bridge;
  return bridge;
}
