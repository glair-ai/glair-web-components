# Bare iframe + GLChat Widget SDK

`gl-chat-widget-sdk` exposes a tawk.to-style `window.GLChat` object. Use this
option when the host owns the iframe directly (for example NUI) instead of
using `<gl-chat-widget>` or `<gl-chat-sidebar>`.

Each `GLChat.init({ iframe })` call returns an API instance bound to that one
iframe, so multiple bare iframes can coexist. For the component-based options,
see [widget](widget.md) and [sidebar](sidebar.md) — component bundles include
the bridge, so their element methods need only the component script tag.

### Method and event reference

| API | Available on | Wire message / effect |
| --- | --- | --- |
| `init({ iframe?, iframeSelector?, origin?, onLoad?, onError? })` | `window.GLChat` | Returns a `GLChatInstance` bound to that iframe (required for a bare iframe) |
| `setIdentity(token, organization?)` or `setIdentity({ token, organization })` | `window.GLChat`, either element | `auth-idp` (partner SSO login) |
| `logout()` | `window.GLChat`, either element | `logout-idp` |
| `setContext(context)` | `window.GLChat`, either element | `page-context` (replaces context) |
| `updateContext(patch)` | `window.GLChat`, either element | `page-context` (merges patch into current context) |
| `clearContext()` | `window.GLChat`, either element | `page-context` with `{}` |
| `open()` / `close()` / `toggle()` | `window.GLChat`, either element | Opens / closes / toggles the on-page component; on a bare iframe these emit `widget_unavailable` instead |
| `on(event, handler)` / `off(event, handler)` | `window.GLChat` | Subscribes to `ready`, `authReady`, `contextReady`, `logoutDone`, `error` |
| `onLoad` / `onError` | `window.GLChat` (assignable properties) | Fires once when ready / on SDK-level errors |

Calls made before the iframe is ready are queued (up to 50) and flushed on the
next `auth-idp-ready` / `page-context-ready` message. The latest context is
replayed automatically on every `page-context-ready` (chat page remount). Page
context must be JSON-serializable and at most 8 KB. Every example below calls
the whole API back-to-back purely as a reference tour — a real app calls only
what the current event needs.

### Security and error handling

The SDK posts only to the exact iframe origin (never `"*"`) and accepts inbound
messages only from that origin **and** that iframe's `contentWindow`. Host
origins must be listed in GLChat's trusted event domains. Tokens are never
logged or attached to error details; the backend must still verify identity and
validate/sandbox page context before it reaches an agent.

Errors are delivered to `onError` and `on('error')` with a stable `code`:

| Code | Meaning |
| --- | --- |
| `widget_unavailable` | No reachable iframe/component, or a post failed. |
| `origin_untrusted` | A known message arrived from an unexpected source or origin. |
| `invalid_payload` | Bad `setIdentity` arguments, or non-serializable context. |
| `too_large` | Page context exceeds 8 KB. |
| `queue_overflow` | More than 50 calls queued before ready; the oldest was dropped. |

`gl-chat-widget` attributes used in the examples: `url` (iframe src),
`position` (`left` / `right`), `color-theme`, and `direct-expand-enabled`
(open straight into fullscreen when the toggle is clicked).
`<gl-chat-sidebar>` uses `url`, `position`, and `width`. If both components are
on one page, use the element facade to address a specific one; the global
facade targets the first component in DOM order.


### Bare iframe setup (e.g. NUI)

No `<gl-chat-widget>` here. The host owns the iframe, so bind it explicitly with
`init()`. `open()` / `close()` / `toggle()` have no component UI to control in
this style: they are no-ops that log a console warning **and** emit
`onError` / `on('error')` with code `widget_unavailable`, so the host can detect
and report the misconfiguration. A runnable version of this recipe is
`test/bare-iframe.html` (`npm run test:bare-iframe`).

```html
<!doctype html>
<html lang="en">
  <body>
    <iframe
      id="glchat-iframe"
      src="https://chat.example.com"
      title="GLChat"
    ></iframe>

    <script type="module" src="https://unpkg.com/@glair/web-components/standalone/gl-chat-widget-sdk.js"></script>
    <script type="module">
      const api = window.GLChat;

      // Bind the iframe. `origin` is optional — it defaults to the iframe src origin.
      api.init({
        iframe: document.querySelector("#glchat-iframe"),
        // origin: "https://chat.example.com",
        onLoad: () => console.log("GLChat ready"),
        onError: (error) => console.warn(error.code, error.message),
      });

      api.onLoad = () => console.log("GLChat ready");
      api.onError = (error) => console.warn(error.code, error.message);

      const onReady = () => console.log("ready");
      api.on("ready", onReady);
      api.on("authReady", () => console.log("auth page ready"));
      api.on("contextReady", () => console.log("chat page ready"));
      api.on("logoutDone", () => console.log("signed out"));
      api.on("error", (error) => console.warn(error.code, error.message));
      api.off("ready", onReady);

      api.setIdentity({ token: "partner-sso-token", organization: "acme" });
      api.setIdentity("partner-sso-token", "acme");
      api.setContext({
        page: { route: "payroll.detail" },
        entities: [{ type: "employee", id: "E-123" }],
        filters: { period: "2026-10" },
        extra: { source: "nui" },
      });
      api.updateContext({ filters: { period: "2026-11" } });
      api.clearContext();

      // No <gl-chat-widget> on this page: these log a warning and emit
      // onError({ code: 'widget_unavailable' }).
      api.open();
      api.close();
      api.toggle();

      api.logout();
    </script>
  </body>
</html>
```


### Multiple bare iframes

`GLChat.init()` returns an API bound to that one iframe. Call it once per iframe
and keep the returned instances:

```js
const chatA = GLChat.init({ iframe: document.querySelector("#chat-a") });
const chatB = GLChat.init({ iframe: document.querySelector("#chat-b") });

chatA.setContext({ page: { route: "payroll" } });
chatB.setContext({ page: { route: "contracts" } });
```

Each instance has its own context, queue and event handlers. Widgets and
sidebars also create one bridge per element, so all three choices can coexist
on one page. See `test/multiple.html` (`npm run test:multiple`).

Messages are always posted to the exact iframe origin (never `"*"`), and
incoming messages are accepted only from that origin and that iframe's
`contentWindow`. The host origin must be listed in GLChat's trusted event
domains (`NEXT_PUBLIC_FEATURE_TRUSTED_EVENT_DOMAINS`).

## Component docs

- [GLChat Widget (`<gl-chat-widget>`)](widget.md)
- [GLChat Sidebar (`<gl-chat-sidebar>`)](sidebar.md)
