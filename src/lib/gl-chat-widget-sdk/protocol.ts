/**
 * Wire protocol shared with glchat-ui (applications/glchat-ui).
 *
 * Every message is a JSON string sent with `postMessage`. Keep these names in
 * sync with the listeners in glchat-ui:
 *   - IDPPage.tsx                    -> auth-idp-ready, auth-idp, logout-idp-done
 *   - IDPLogoutListener.tsx          -> logout-idp
 *   - PageContextListener.tsx (PR 16765) -> page-context-ready, page-context
 */

/** Messages the chat/auth iframe sends to the host page. */
export const INBOUND_EVENTS = [
  "auth-idp-ready",
  "page-context-ready",
  "logout-idp-done",
] as const;

/** Messages the host page sends to the chat/auth iframe. */
export const OUTBOUND_EVENTS = ["auth-idp", "logout-idp", "page-context"] as const;

export type InboundEvent = (typeof INBOUND_EVENTS)[number];
export type OutboundEvent = (typeof OUTBOUND_EVENTS)[number];

const INBOUND_SET = new Set<string>(INBOUND_EVENTS);
const KNOWN_SET = new Set<string>([...INBOUND_EVENTS, ...OUTBOUND_EVENTS]);

/** Returns true for any message type the SDK knows about. Unrelated `window`
 * messages (browser extensions, analytics) are ignored silently so they can
 * never spam host error handlers. */
export function isKnownEvent(type: unknown): type is InboundEvent | OutboundEvent {
  return typeof type === "string" && KNOWN_SET.has(type);
}

export function isInboundEvent(type: unknown): type is InboundEvent {
  return typeof type === "string" && INBOUND_SET.has(type);
}

/** Parse a JSON-stringified payload, returning undefined when it is not a
 * plain object with a string `type`. */
export function parseMessage(data: unknown): Record<string, unknown> | undefined {
  if (typeof data !== "string") return undefined;

  let payload: unknown;
  try {
    payload = JSON.parse(data);
  } catch {
    return undefined;
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }
  if (typeof (payload as Record<string, unknown>).type !== "string") {
    return undefined;
  }
  return payload as Record<string, unknown>;
}

/** Build a JSON-stringified message with a `type` field. */
export function buildMessage(
  type: OutboundEvent,
  payload: Record<string, unknown> = {},
): string {
  return JSON.stringify({ type, ...payload });
}
