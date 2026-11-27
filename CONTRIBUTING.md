# Contributing

This guide covers development of **all** components in this repository. It
includes a dedicated section for the GLChat family — `<gl-chat-widget>`,
`<gl-chat-sidebar>`, and the `gl-chat-widget-sdk` they share — because those
have extra protocol and testing requirements. New components should follow the
general workflow below.

## Prerequisites

- Node.js 22.x (the version used by the publish workflow) and npm
- A Chromium-based browser for the manual test harnesses

```sh
npm install
```

## Repository layout

### Shared structure

| Path | Purpose |
| --- | --- |
| `src/components/` | One Lit custom element per file. Every file here becomes a build entry automatically. |
| `src/lib/`, `src/utils/` | Shared logic and helpers used by components. |
| `docs/` | Per-component and SDK documentation. |
| `test/` | Manual integration harnesses and mock pages. |
| `index.html` | Vite dev playground for quick manual checks. |
| `build-standalone.js`, `vite.config.ts` | Build configuration. |
| `lib/`, `standalone/` | Generated output (gitignored). Do not edit by hand. |

Existing components include `<gl-chat-widget>`, `<gl-chat-sidebar>`,
`<gl-chat-gemini-live>`, and `<glair-webcam>`; supporting code lives in
`src/lib/glchat-gemini-live/` and `src/utils/`. Future components belong in
`src/components/` alongside them.

`vite.config.ts` uses every file in `src/components/` as a library entry, and
`build-standalone.js` builds every component file (except
`tailwind.element.ts`) into `standalone/`. **Adding a file to
`src/components/` automatically produces both `lib/<name>.js` and
`standalone/<name>.js`** — no build config change is needed.

### GLChat family

| Path | Purpose |
| --- | --- |
| `src/components/gl-chat-widget.ts` | Widget element. Owns the iframe; hosts the element SDK facade. |
| `src/components/gl-chat-sidebar.ts` | Sidebar element. Same SDK methods as the widget. |
| `src/components/gl-chat-widget-sdk.ts` | SDK entry point; installs `window.GLChat` on import. |
| `src/lib/gl-chat-widget-sdk/protocol.ts` | Wire protocol: JSON `postMessage` event names and helpers. |
| `src/lib/gl-chat-widget-sdk/bridge.ts` | Shared bridge: target discovery, queueing, origin checks, events. |
| `src/lib/gl-chat-widget-sdk/global.ts` | `window.GLChat` facade (`onLoad`, `onError`, methods). |
| `src/lib/gl-chat-widget-sdk/types.ts` | Public types (context, identity, errors, events). |
| `docs/gl-chat-widget-sdk.md` | Full SDK API reference and integration recipes. |

## Architecture notes

### General components

- Components are Lit `LitElement` classes decorated with `@customElement(...)`;
  public `@property` fields become kebab-case HTML attributes.
- Keep shared, non-rendering logic in `src/lib/` or `src/utils/` rather than
  inside component files.
- TypeScript is strict: `noUnusedLocals`, `noUnusedParameters`, and
  `noImplicitReturns` are enabled. Match the existing style: 2-space indent,
  double quotes, semicolons.

### GLChat family

- The SDK is **one bridge, two facades**. `getBridge()` returns a page-wide
  instance stored under a well-known `Symbol.for(...)` key so separately built
  standalone bundles share it. `window.GLChat` and the element methods delegate
  to the same bridge. Component bundles include the bridge and attach its
  `message` listener on connect, so element methods work without the SDK script;
  only the global facade requires it.
- Both components register themselves with the bridge in `connectedCallback`
  and unregister in `disconnectedCallback`. Element methods call
  `setWidget(this)` before delegating so they target the right iframe when both
  components are present.
- Messages are JSON strings sent with an **exact target origin** (never `"*"`).
  Incoming messages are accepted only from the iframe's `contentWindow` and
  that origin. Unknown message types are ignored silently.
- Calls made before `auth-idp-ready` / `page-context-ready` are queued (max 50)
  and flushed on the next ready signal. The latest context is replayed on every
  `page-context-ready` (chat page remount). `onLoad` fires once.
- Page context is untrusted input: the SDK enforces JSON-serializability and an
  8 KB cap, and never attaches identity tokens to error details. Keep backend
  validation and prompt fencing in `glchat-ui`.
- **Keep the wire protocol in sync with `glchat-ui`** (repo at
  `GDP-ADMIN/glchat`, app under `applications/glchat-ui`):

  | Direction | Event | Source in glchat-ui |
  | --- | --- | --- |
  | iframe → host | `auth-idp-ready`, `logout-idp-done` | `pages/authentication/IDPPage.tsx` |
  | host → iframe | `auth-idp` | `pages/authentication/IDPPage.tsx` |
  | host → iframe | `logout-idp` | `listeners/IDPLogoutListener.tsx` |
  | iframe → host | `page-context-ready` | `PageContextListener.tsx` (PR 16765) |
  | host → iframe | `page-context` | `PageContextListener.tsx` / `docs/glchat-widget-page-context.md` |

## Development workflow

1. Edit the source under `src/`.
2. Typecheck and build before opening a PR:

   ```sh
   npx tsc
   npm run build
   ```

   `npm run build` cleans `lib/` and `standalone/`, emits declarations with
   `tsc`, bundles library entries with Vite, and builds the standalone bundles.
3. Add or update the relevant doc in `docs/` (or a section in `README.md` for
   components documented there). The SDK docs live in
   `docs/gl-chat-widget-sdk.md`; `README.md` only links to them.
4. Run the dev server / harnesses and verify the behavior you changed.

## Testing

There is no automated unit test runner in this repo. Use the dev server and
manual harnesses plus a typecheck/build.

### Any component

```sh
npm run dev
```

Starts the Vite dev server (HTTPS via `@vitejs/plugin-basic-ssl`), serving
`index.html` as a playground. Accept the browser's self-signed-certificate
warning. Use it for quick checks of any component — import the component module
from `/src/components/<name>.ts` and add markup to `index.html` or use a
dedicated HTML page under `test/`.

### GLChat widget, sidebar, and SDK

```sh
npm run test:widget        # opens /test/widget-sdk.html
npm run test:sidebar       # opens /test/sidebar-sdk.html
npm run test:bare-iframe   # opens /test/bare-iframe-sdk.html
npm run test:element-only  # opens /test/element-only.html
```

- `test/widget-sdk.html` loads `<gl-chat-widget>` + the SDK entry from source.
- `test/sidebar-sdk.html` loads `<gl-chat-sidebar>` + the SDK entry from source.
- `test/bare-iframe-sdk.html` uses only a plain `<iframe>` bound with
  `GLChat.init({ iframe })` — no web component. `open()` / `close()` /
  `toggle()` are no-ops there: they log a warning and emit `widget_unavailable`
  through `onError` / `on('error')` because there is no component UI to control.
- `test/element-only.html` loads only the component scripts (no SDK entry) and
  verifies that element methods on both the widget and the sidebar deliver
  messages, with `window.GLChat` absent.
- `test/mock-chat.html` is the iframe target for all four. It posts
  `page-context-ready` on load, records messages received from the host, and
  forwards them to the host page as `{ type: 'glchat-test:received', payload }`
  (an unknown event type to the SDK, so it does not interfere).
- All harness pages have buttons for every SDK method and a log showing fired
  events and messages received by the iframe. The widget and sidebar harnesses
  additionally cover the element facade.

Verification checklist:

- On load, the log shows `event ready`, `event contextReady`, and `onLoad fired`.
- `setIdentity(...)`, `logout()`, `setContext()`, `updateContext()`,
  `clearContext()` appear in the iframe log with the expected wire payload.
- `open()`, `close()`, `toggle()` work from both `GLChat` and the element.
- Assigning `onLoad` / `onError` and `on(event, handler)` logs callbacks;
  `off(event, handler)` stops the specific handler.
- Calls made before ready are queued (put the SDK script before the component
  markup to simulate this) and are delivered after `page-context-ready`.
- `GLChat.init({ iframe })` works for a bare iframe without a web component
  (`npm run test:bare-iframe`, recipe 4 in `docs/gl-chat-widget-sdk.md`).

### Adding a new web component

1. Create `src/components/<name>.ts` with a `@customElement("...")` Lit class.
   No build config change is needed — both library and standalone entries are
   generated automatically.
2. Put reusable non-rendering logic in `src/lib/` or `src/utils/`.
3. Add `docs/<name>.md` and link it from the component table in `README.md`.
4. For complex integrations, add a harness under `test/` and, if useful, an npm
   script in `package.json` (see `test:widget` / `test:sidebar` for the pattern).
5. Run `npx tsc`, `npm run build`, and verify the component in the dev server or
   its harness.

### Adding a new SDK method or event

1. Add the wire event/helper to `src/lib/gl-chat-widget-sdk/protocol.ts` and
   confirm the name against `glchat-ui`.
2. Add the method and any state to `src/lib/gl-chat-widget-sdk/bridge.ts`.
3. Add it to `GLChatGlobal` and the facade in `global.ts`.
4. Add the same method to **both** `gl-chat-widget.ts` and
   `gl-chat-sidebar.ts`.
5. Add buttons to **both** harness pages and update `docs/gl-chat-widget-sdk.md`
   (method reference + recipes) plus the component docs if relevant.
6. Run `npx tsc`, `npm run build`, and both harnesses.

## Pull requests

- Keep changes scoped to one component/SDK concern; mention which dev server or
  harness you used to verify it.
- Do not commit generated `lib/` or `standalone/` output — they are gitignored.
- npm publishing is handled by the release workflow for tags ending in
  `-npm` (or `-npm-dry-run`); it runs `npm run build` before publishing.
