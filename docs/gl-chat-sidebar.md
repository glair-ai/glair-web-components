# GLChat Sidebar (`<gl-chat-sidebar>`)

A side panel that embeds a GLChat page in an iframe. It exposes the same
[Widget SDK](gl-chat-widget-sdk.md) methods as `<gl-chat-widget>`; the global
`window.GLChat` facade detects either component automatically.

## Installation

```html
<!-- script tag -->
<script
  type="module"
  src="https://unpkg.com/@glair/web-components/standalone/gl-chat-sidebar.js"
></script>
```

```js
// ES module
import "@glair/web-components/lib/gl-chat-sidebar";
```

## Initialization

```html
<gl-chat-sidebar
  url="https://chat.example.com"
  position="right"
  width="375"
></gl-chat-sidebar>
```

## Attributes

| Attribute | Property | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `url` | `url` | `string` | `""` | Chat page URL loaded in the iframe. |
| `position` | `position` | `"left" \| "right"` | `"right"` | Screen edge for the panel. |
| `width` | `width` | `number` | `375` | Panel width in pixels. |

## Slots

| Slot | Description |
| --- | --- |
| `icon` | Replaces the default collapsed toggle button icon. |

## Methods

UI control:

| Method | Description |
| --- | --- |
| `open()` | Shows the sidebar. |
| `close()` | Hides the sidebar. |
| `toggle()` | Toggles the sidebar. |

Host SDK methods (identical to `<gl-chat-widget>`):

| Method | Description |
| --- | --- |
| `setIdentity(token, organization?)` / `setIdentity({ token, organization })` | Partner SSO login (`auth-idp`). |
| `logout()` | Partner SSO logout (`logout-idp`). |
| `setContext(context)` | Replaces the page context (`page-context`). |
| `updateContext(patch)` | Merges a patch into the current context. |
| `clearContext()` | Clears the context so stale data is not reused. |

```js
const sidebar = document.querySelector("gl-chat-sidebar");
sidebar.setContext({ entities: [{ type: "employee", id: "E-123" }] });
sidebar.open();
```

## Behavior notes

- Opening the sidebar adds a matching `margin-left` / `margin-right` to
  `document.body`; closing removes it.
- If both a widget and a sidebar are on one page, call methods on the specific
  element to address it. The global `window.GLChat` facade targets the first
  component in DOM order.

## Testing

```sh
npm run test:sidebar   # opens test/sidebar-sdk.html with the Vite dev server
```

The harness loads `<gl-chat-sidebar>` together with the SDK, a mock chat iframe,
and controls for every SDK method and event.
