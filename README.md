<p align="center">
  <a href="https://docs.glair.ai" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://glair-chart.s3.ap-southeast-1.amazonaws.com/images/glair-horizontal-logo-blue.png">
      <source media="(prefers-color-scheme: light)" srcset="https://glair-chart.s3.ap-southeast-1.amazonaws.com/images/glair-horizontal-logo-color.png">
      <img alt="GLAIR" src="https://glair-chart.s3.ap-southeast-1.amazonaws.com/images/glair-horizontal-logo-color.png" width="180" height="60" style="max-width: 100%;">
    </picture>
  </a>
</p>

<p align="center">
  A collection of GLAIR's web components.
<p>

<p align="center">
    <a href="https://github.com/glair-ai/glair-web-components/releases"><img src="https://img.shields.io/npm/v/@glair/glair-web-components" alt="Latest Release"></a>
    <a href="https://github.com/glair-ai/glair-web-components/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@glair/glair-web-components" alt="License"></a>
</p>

# Basic Usage

There are two ways to consume GLAIR web components:

1. [Directly via `<script>` tag](#directly-via-script-tag).
2. [Via ES Module (recommended if you use module bundler or framework e.g., NextJS)](#via-es-module).

## Directly via `<script>` tag

Add the following `<script>` tag after `<body>`. Replace the `{web-component-name}` as needed.

```html
<script
  type="module"
  src="https://unpkg.com/@glair/glair-web-components/standalone/{web-component-name}.js"
></script>
```

Fully working sample (passive liveness component):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GLAIR's Web Components</title>

    <!-- You can override the component's styling using CSS  -->
    <style>
      glair-passive-liveness {
        font-family: ui-sans-serif, system-ui;
      }
    </style>
  </head>
  <body>
    <glair-passive-liveness></glair-passive-liveness>
  </body>
  <script
    type="module"
    src="https://unpkg.com/@glair/glair-web-components/standalone/passive-liveness.js"
  ></script>
  <script>
    const pl = document.querySelector("glair-passive-liveness");
    pl.addEventListener("onscreenshot", async (event) => {
      console.log(event.detail.payload);
    });
  </script>
</html>
```

## Via ES Module

Install the `@glair/glair-web-components` from NPM:

```sh
npm install @glair/glair-web-components
```

You can import web components individually. The sample assumes you're using React, but you can extrapolate it for other frameworks.

```js
// If the web component does not access window object on mount, use this
import from "@glair/glair-web-components/lib/{web-component-name}";

// If the web component accesses window object on mount (e.g. passive-liveness), we need to import it in useEffect
useEffect(() => {
  const execute = async () => {
    await import("@glair/gair-web-components/lib/passive-liveness");
  }
  execute();
}, []);
```

---

## List of GLAIR Web Components

| Name                                  | Tag                        | `<script>`                     | ES Module               |
| ------------------------------------- | -------------------------- | ------------------------------ | ----------------------- |
| [Passive Liveness](#passive-liveness) | `<glair-passive-liveness>` | `/standalone/passive-liveness` | `/lib/passive-liveness` |
| [Active Liveness](#active-liveness)   | _in development_           | _in development_               | _in development_        |

---

## Passive Liveness

This component accesses `window` object on mount.

### Event Listeners

1. `onscreenshot`

Invoked when user presses camera button. The `event` parameter contains image in `Blob` format. Add a listener to this event so you can send the image to your server for detecting passive liveness.

```js
const pl = document.querySelector("glair-passive-liveness");
pl.addEventListener("onscreenshot", async (event) => {
  console.log(event.detail.payload);
});
```

### Active Liveness

```js
// In development
```

We also plan to create a more compose-able web components so you can have more control.
