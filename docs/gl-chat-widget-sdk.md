# GLChat Widget SDK (tawk.to-style)


`gl-chat-widget-sdk` exposes a `window.GLChat` object, the same pattern as tawk.to's
`Tawk_API`. It is the public API for communicating with the chat iframe; host
pages never reach into the widget's shadow DOM or assemble `postMessage`
payloads themselves.

The SDK works with both `<gl-chat-widget>` and `<gl-chat-sidebar>` — the global
`window.GLChat` facade targets whichever GLChat component is on the page, and
both elements expose the same method set. There are five integration recipes
below (four loading styles plus a sidebar example). They all use the **same
bridge**, so the wire protocol and queueing behaviour are identical; only how
you load the SDK and which facade you call differ.

### Method and event reference

| API | Available on | Wire message / effect |
| --- | --- | --- |
| `init({ iframe?, iframeSelector?, origin?, onLoad?, onError? })` | `window.GLChat` | Binds an explicit iframe/origin (required for a bare iframe) |
| `setIdentity(token, organization?)` or `setIdentity({ token, organization })` | `window.GLChat`, either element | `auth-idp` (partner SSO login) |
| `logout()` | `window.GLChat`, either element | `logout-idp` |
| `setContext(context)` | `window.GLChat`, either element | `page-context` (replaces context) |
| `updateContext(patch)` | `window.GLChat`, either element | `page-context` (merges patch into current context) |
| `clearContext()` | `window.GLChat`, either element | `page-context` with `{}` |
| `open()` / `close()` / `toggle()` | `window.GLChat`, either element | Opens / closes / toggles the on-page component |
| `on(event, handler)` / `off(event, handler)` | `window.GLChat` | Subscribes to `ready`, `authReady`, `contextReady`, `logoutDone`, `error` |
| `onLoad` / `onError` | `window.GLChat` (assignable properties) | Fires once when ready / on SDK-level errors |

Calls made before the iframe is ready are queued and flushed on the next
`auth-idp-ready` / `page-context-ready` message. The latest context is replayed
automatically on every `page-context-ready` (chat page remount). Every example
below calls the whole API back-to-back purely as a reference tour — a real app
calls only what the current event needs.

`gl-chat-widget` attributes used in the examples: `url` (iframe src),
`position` (`left` / `right`), `color-theme`, and `direct-expand-enabled`
(open straight into fullscreen when the toggle is clicked).
`<gl-chat-sidebar>` uses `url`, `position`, and `width`. If both components are
on one page, use the element facade to address a specific one; the global
facade targets the first component in DOM order.

### 1. Script tag + global `window.GLChat`

```html
<!doctype html>
<html lang="en">
  <body>
    <!-- Optional: set hooks before the SDK loads. Calls are queued anyway. -->
    <script>
      window.GLChat = window.GLChat || {};
      GLChat.onLoad = () => console.log("GLChat ready");
      GLChat.onError = (error) => console.warn(error.code, error.message);
    </script>

    <!-- Load the SDK, then the component. Module scripts are deferred. -->
    <script type="module" src="https://unpkg.com/@glair/web-components/standalone/gl-chat-widget-sdk.js"></script>
    <script type="module" src="https://unpkg.com/@glair/web-components/standalone/gl-chat-widget.js"></script>

    <!-- Initialize the component. -->
    <gl-chat-widget
      id="chat"
      url="https://chat.example.com"
      position="right"
      color-theme="#00709F"
    ></gl-chat-widget>

    <!-- Full API tour via the global object. -->
    <script type="module">
      const api = window.GLChat;

      // Events
      const onReady = () => console.log("ready");
      const onAuthReady = () => console.log("auth page ready");
      const onContextReady = () => console.log("chat page ready");
      const onLogoutDone = () => console.log("signed out");
      const onError = (error) => console.warn(error.code, error.message);
      api.on("ready", onReady);
      api.on("authReady", onAuthReady);
      api.on("contextReady", onContextReady);
      api.on("logoutDone", onLogoutDone);
      api.on("error", onError);
      // api.off("ready", onReady);

      // Identity — object form and (token, organization) form are equivalent.
      api.setIdentity({ token: "partner-sso-token", organization: "acme" });
      api.setIdentity("partner-sso-token", "acme");

      // Context
      api.setContext({
        page: { route: "payroll.detail", title: "Payroll – Budi Santoso" },
        entities: [{ type: "employee", id: "E-123", label: "Budi Santoso" }],
        filters: { period: "2026-10" },
        extra: { source: "catapa" },
      });
      api.updateContext({ filters: { period: "2026-11" } });
      api.clearContext();

      // Widget UI and partner SSO logout
      api.open();
      api.close();
      api.toggle();
      api.logout();
    </script>
  </body>
</html>
```

`init()` is not needed here: the SDK automatically finds the iframe inside
`<gl-chat-widget>`.

### 2. Script tag + element methods

The SDK script is still loaded — it installs the global facade used for event
subscription — but every call is made on the element instead.

```html
<!doctype html>
<html lang="en">
  <body>
    <script type="module" src="https://unpkg.com/@glair/web-components/standalone/gl-chat-widget-sdk.js"></script>
    <script type="module" src="https://unpkg.com/@glair/web-components/standalone/gl-chat-widget.js"></script>

    <!-- Initialize the component. -->
    <gl-chat-widget
      id="chat"
      url="https://chat.example.com"
      position="left"
      color-theme="#00709F"
      direct-expand-enabled
    ></gl-chat-widget>

    <script type="module">
      await customElements.whenDefined("gl-chat-widget");
      const widget = document.querySelector("#chat");

      // All element methods (same bridge as window.GLChat)
      widget.setIdentity({ token: "partner-sso-token", organization: "acme" });
      widget.setIdentity("partner-sso-token", "acme");
      widget.setContext({
        page: { route: "payroll.detail" },
        entities: [{ type: "employee", id: "E-123" }],
        filters: { period: "2026-10" },
      });
      widget.updateContext({ filters: { period: "2026-11" } });
      widget.clearContext();
      widget.open();
      widget.close();
      widget.toggle();
      widget.logout();

      // Events are subscribed through the global facade; it shares the bridge
      // with the element, so it sees the same messages.
      GLChat.onLoad = () => console.log("GLChat ready");
      GLChat.onError = (e) => console.warn(e.code, e.message);
      GLChat.on("ready", () => console.log("ready"));
      GLChat.on("authReady", () => console.log("auth page ready"));
      GLChat.on("contextReady", () => console.log("chat page ready"));
      GLChat.on("logoutDone", () => console.log("signed out"));
      GLChat.on("error", (e) => console.warn(e.code, e.message));
    </script>
  </body>
</html>
```

### 3. ES module (bundler / framework)

```html
<!-- index.html -->
<script type="module" src="/app.js"></script>
<gl-chat-widget
  id="chat"
  url="https://chat.example.com"
  position="right"
  color-theme="#00709F"
></gl-chat-widget>
```

```js
// app.js
import "@glair/web-components/lib/gl-chat-widget";
import { installGLChatGlobal } from "@glair/web-components/lib/gl-chat-widget-sdk";

// Idempotent: the module also installs on import, so this is safe to call.
const api = installGLChatGlobal();

api.onLoad = () => console.log("GLChat ready");
api.onError = (error) => console.warn(error.code, error.message);

const onReady = () => console.log("ready");
api.on("ready", onReady);
api.on("authReady", () => console.log("auth page ready"));
api.on("contextReady", () => console.log("chat page ready"));
api.on("logoutDone", () => console.log("signed out"));
api.on("error", (error) => console.warn(error.code, error.message));

api.setIdentity({ token: "partner-sso-token", organization: "acme" });
api.setIdentity("partner-sso-token", "acme");
api.setContext({
  page: { route: "payroll.detail" },
  entities: [{ type: "employee", id: "E-123" }],
  filters: { period: "2026-10" },
  extra: { source: "catapa" },
});
api.updateContext({ filters: { period: "2026-11" } });
api.clearContext();
api.open();
api.close();
api.toggle();
api.logout();
api.off("ready", onReady);

// The element facade is available too (same bridge).
await customElements.whenDefined("gl-chat-widget");
const widget = document.querySelector("#chat");
widget.setContext({ page: { route: "payroll.detail" } });
widget.open();
```

### 4. Bare iframe (e.g. NUI)

No `<gl-chat-widget>` here. The host owns the iframe, so bind it explicitly with
`init()`. `open()` / `close()` / `toggle()` have no component to control in this
style and log a warning instead. A runnable version of this recipe is
`test/bare-iframe-sdk.html` (`npm run test:bare-iframe`).

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

      // No <gl-chat-widget> on this page: these log a warning.
      api.open();
      api.close();
      api.toggle();

      api.logout();
    </script>
  </body>
</html>
```

### 5. `<gl-chat-sidebar>` (same SDK, same protocol)

`<gl-chat-sidebar>` exposes the identical method set and is detected by the
global facade automatically. Load the sidebar component instead of the widget
component (or alongside it):

```html
<!doctype html>
<html lang="en">
  <body>
    <script>
      window.GLChat = window.GLChat || {};
      GLChat.onLoad = () => console.log("GLChat ready");
      GLChat.onError = (e) => console.warn(e.code, e.message);
    </script>
    <script type="module" src="https://unpkg.com/@glair/web-components/standalone/gl-chat-widget-sdk.js"></script>
    <script type="module" src="https://unpkg.com/@glair/web-components/standalone/gl-chat-sidebar.js"></script>

    <!-- Initialize the sidebar component. -->
    <gl-chat-sidebar
      id="chat-sidebar"
      url="https://chat.example.com"
      position="right"
      width="375"
    ></gl-chat-sidebar>

    <script type="module">
      await customElements.whenDefined("gl-chat-sidebar");
      const sidebar = document.querySelector("#chat-sidebar");

      // Full element API — identical to <gl-chat-widget>
      sidebar.setIdentity({ token: "partner-sso-token", organization: "acme" });
      sidebar.setIdentity("partner-sso-token", "acme");
      sidebar.setContext({
        page: { route: "payroll.detail" },
        entities: [{ type: "employee", id: "E-123" }],
        filters: { period: "2026-10" },
        extra: { source: "catapa" },
      });
      sidebar.updateContext({ filters: { period: "2026-11" } });
      sidebar.clearContext();
      sidebar.open();
      sidebar.close();
      sidebar.toggle();
      sidebar.logout();

      // Events via the global facade (shares the bridge with the sidebar)
      GLChat.onLoad = () => console.log("GLChat ready");
      GLChat.onError = (error) => console.warn(error.code, error.message);
      GLChat.on("ready", () => console.log("ready"));
      GLChat.on("authReady", () => console.log("auth page ready"));
      GLChat.on("contextReady", () => console.log("chat page ready"));
      GLChat.on("logoutDone", () => console.log("signed out"));
      GLChat.on("error", (error) => console.warn(error.code, error.message));

      // Global calls also target this sidebar when it is the only component.
      GLChat.setContext({ page: { route: "payroll.detail" } });
      GLChat.open();
    </script>
  </body>
</html>
```

Messages are always posted to the exact iframe origin (never `"*"`), and
incoming messages are accepted only from that origin and that iframe's
`contentWindow`. The host origin must be listed in GLChat's trusted event
domains (`NEXT_PUBLIC_FEATURE_TRUSTED_EVENT_DOMAINS`).

## Component docs

- [GLChat Widget (`<gl-chat-widget>`)](gl-chat-widget.md)
- [GLChat Sidebar (`<gl-chat-sidebar>`)](gl-chat-sidebar.md)

