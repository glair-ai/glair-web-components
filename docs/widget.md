# GLChat Widget (`<gl-chat-widget>`)

A floating chat button and panel that embeds a GLChat page in an iframe. The
component owns the iframe; host pages use the [Widget SDK](bare-iframe.md)
to exchange identity and page context with it instead of touching the shadow
DOM.

## Installation

```html
<!-- script tag -->
<script
  type="module"
  src="https://unpkg.com/@glair/web-components/standalone/gl-chat-widget.js"
></script>
```

```js
// ES module
import "@glair/web-components/lib/gl-chat-widget";
```

## Initialization

```html
<gl-chat-widget
  url="https://chat.example.com"
  position="right"
  color-theme="#00709F"
></gl-chat-widget>
```

## Attributes

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `url` | `url` | `string` | `""` | Chat page URL loaded in the iframe. |
| `position` | `position` | `"left" \| "right"` | `"right"` | Screen edge for the button and panel. |
| `color-theme` | `colorTheme` | `string` | `"#00709F"` | Toggle button color when collapsed. |
| `direct-expand-enabled` | `directExpandEnabled` | `boolean` | `false` | Clicking the toggle opens fullscreen directly. |

## Slots

| Slot | Description |
| --- | --- |
| `icon` | Replaces the default collapsed toggle button icon. |

## Methods

UI control:

| Method | Description |
| --- | --- |
| `open()` | Shows the widget (on mobile: fullscreen). |
| `close()` | Hides the widget. |
| `toggle()` | Toggles between hidden and shown. |

Host SDK methods (see [bare-iframe.md](bare-iframe.md) for the
wire messages they send):

| Method | Description |
| --- | --- |
| `setIdentity(token, organization?)` / `setIdentity({ token, organization })` | Partner SSO login (`auth-idp`). |
| `logout()` | Partner SSO logout (`logout-idp`). |
| `setContext(context)` | Replaces the page context (`page-context`). |
| `updateContext(patch)` | Merges a patch into the current context. |
| `clearContext()` | Clears the context so stale data is not reused. |

```js
const widget = document.querySelector("gl-chat-widget");
widget.setContext({ page: { route: "payroll.detail" } });
widget.open();
```

**You do not need to load `gl-chat-widget-sdk.js` for these element calls.**
The component bundle includes the bridge, so a single
`/standalone/gl-chat-widget.js` script tag is enough. Loading the SDK script as
well adds the `window.GLChat` facade (`onLoad`, `onError`, `on`/`off`,
`init({ iframe })`, global methods). See
[test/element-only.html](../test/element-only.html) (`npm run test:element-only`).

Several widgets can coexist: each element owns its own bridge, so
`document.querySelectorAll("gl-chat-widget")` gives one independent API per
element. See [test/multiple.html](../test/multiple.html) (`npm run test:multiple`).

## Behavior notes

- On screens ≤ 768 px the panel opens in fullscreen and body scroll is locked
  while it is open.
- `url` changes are applied to the iframe via `updated()`; the [SDK](bare-iframe.md)
  re-sends the latest context whenever the chat page emits `page-context-ready`
  again (for example after an iframe reload).

## Testing

```sh
npm run test:widget   # opens test/widget.html with the Vite dev server
```

The harness loads `<gl-chat-widget>` together with the SDK, a mock chat iframe,
and controls for every SDK method and event.
