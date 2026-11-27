/**
 * Standalone SDK entry point.
 *
 * Usage (script tag):
 *   <script>window.GLChat = window.GLChat || {};</script>
 *   <script type="module" src=".../standalone/gl-chat-widget-sdk.js"></script>
 *
 * Importing this module installs `window.GLChat` as a side effect. ES module
 * consumers can import from `@glair/web-components/lib/gl-chat-widget-sdk`
 * instead and call `installGLChatGlobal()` explicitly.
 */
import { installGLChatGlobal } from "../lib/gl-chat-widget-sdk";

export * from "../lib/gl-chat-widget-sdk";

installGLChatGlobal();
