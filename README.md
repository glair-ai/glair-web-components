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
    <a href="https://github.com/glair-ai/glair-web-components/releases"><img src="https://img.shields.io/npm/v/@glair/web-components" alt="Latest Release"></a>
    <a href="https://github.com/glair-ai/glair-web-components/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@glair/web-components" alt="License"></a>
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
  src="https://unpkg.com/@glair/web-components/standalone/{web-component-name}.js"
></script>
```

Specify version number if you want to use a specific version. For example:

```html
<script
  type="module"
  src="https://unpkg.com/@glair/web-components@0.0.1-beta.5/standalone/{web-component-name}.js"
></script>
```

Fully working sample using [glair-webcam](#webcam) component ([CodeSandbox demo link](https://codesandbox.io/embed/dazzling-tristan-wkxhpc?fontsize=14&hidenavigation=1&theme=dark)):

```html
<!DOCTYPE html>
<html>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GLAIR's Web Components</title>
  <style>
    #webcam-wrapper {
      width: 480px;
      margin: 0 auto;
    }

    #instruction {
      background: black;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 2rem;
      text-align: center;
    }

    #sshot-btn {
      cursor: pointer;
      border: 2px solid white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      background: red;
    }
  </style>
  <body>
    <div id="webcam-wrapper">
      <glair-webcam></glair-webcam>
      <div id="instruction">
        <p style="font-weight: bold">Take photo</p>
        <button id="sshot-btn"></button>
        <p>Make sure your face is clearly visible on the marked area</p>
      </div>
    </div>
  </body>

  <script
    type="module"
    src="https://unpkg.com/@glair/web-components/standalone/webcam.js"
  ></script>
  <script>
    const glairWebcam = document.querySelector("glair-webcam");
    glairWebcam.setAttribute(
      "screenshotArea",
      JSON.stringify({
        x: 25,
        y: 25,
        width: 50,
        height: 50,
        enableOverlay: true,
      })
    );
    const btn = document.querySelector("#sshot-btn");

    btn.addEventListener("click", async () => {
      const base64sshot = await glairWebcam.screenshot();
      const fetchSshot = await fetch(base64sshot);
      const blob = await fetchSshot.blob();
      console.log(base64sshot, blob);

      // Send the blob to your backend server
      // Then, your backend server can send it to GLAIR Vision's API
    });
  </script>
</html>
```

## Via ES Module

Install the `@glair/web-components` from NPM:

```sh
npm install @glair/web-components
```

Then on the code:

```js
import "@glair/web-components/lib/{web-component-name}";
// Now you can render <glair-webcam></glair-webcam>
```

---

## List of GLAIR Web Components

| No  | Name              | Tag              | `<script>`           | ES Module     | Demo                                                                                                                                                                                |
| --- | ----------------- | ---------------- | -------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [Webcam](#webcam) | `<glair-webcam>` | `/standalone/webcam` | `/lib/webcam` | [![Edit dazzling-tristan-wkxhpc](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/dazzling-tristan-wkxhpc?fontsize=14&hidenavigation=1&theme=dark) |

---

## Webcam

This component provides you an easier access for webcam. It is a wrapper around [MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).

### Attributes

| Name             | Type    | Default Value | Notes                                                                                                                                                                                                     |
| ---------------- | ------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `width`          | number  | `480`         | The width of the webcam and the width of the screenshot's result.                                                                                                                                         |
| `height`         | number  | `480`         | The height of the webcam and the height of the screenshot's result.                                                                                                                                       |
| `facingMode`     | string  | `user`        | Corresponds to `MediaTrackConstraints.facingMode`. Set to `environment` to use rear camera. See [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode) for detail. |
| `mirrored`       | boolean | `false`       | Set to `true` to mirror the video horizontally.                                                                                                                                                           |
| `screenshotArea` | string  | `{"x":0...}`  | Enables custom and configurable screenshots, defining the area and overlay display. More detail [here](#screenshot-area).                                                                                 |

#### Screenshot Area

`screenshotArea` property is a JSON object string that enables custom screenshots with specific area and overlay configurations. This property consists of five sub-properties:

| Name            | Type    | Default Value | Notes                                                                                                                                                                                          |
| --------------- | ------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `x`             | number  | `0`           | Represents the horizontal starting coordinate point (**_as a percentage_**) from where the screenshot will be captured. It defines the left-most coordinate of the region to capture. [0, 100] |
| `y`             | number  | `0`           | Represents the vertical starting coordinate point (**_as a percentage_**) from where the screenshot will be captured. It defines the top-most coordinate of the region to capture. [0, 100]    |
| `width`         | number  | `100`         | Determines the width (**_as a percentage_**) of the screenshot area. It defines the horizontal extent of the region to capture from the starting point `x`. (0, 100]                           |
| `height`        | number  | `100`         | Determines the height (**_as a percentage_**) of the screenshot area. It defines the vertical extent of the region to capture from the starting point `y`. (0, 100]                            |
| `enableOverlay` | boolean | `false`       | A boolean that determines whether the overlay for the screenshot should be displayed or not                                                                                                    |

### Slots

Slots here mean the [Web Component Slot element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot). This allows you to plug-in your own custom elements to the slot and override the default behavior.

| Slot Name          | Note Case                                                                              |
| ------------------ | -------------------------------------------------------------------------------------- |
| `user-media`       | Displayed when the component receives a media stream (camera access granted).          |
| `user-media-error` | Displayed when the component can't receive a media stream (camera access not granted). |

### Methods

| Method signature | Return Value      | Description                                                                      |
| ---------------- | ----------------- | -------------------------------------------------------------------------------- |
| `screenshot()`   | `Promise<string>` | Returns a promise of base64 encoded string of the current image shown on webcam. |

### Sample Usages

Sample usage for `glair-webcam` has been provided at [Basic Usage](#basic-usage) section.

Sample usage with custom element for slot `user-media-error`:

```html
<glair-webcam>
  <div
    slot="user-media-error"
    style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
  >
    Camera permission denied
  </div>
</glair-webcam>
```

### Use Cases

`glair-webcam` will help you to create OCR or face biometrics UI. You can use it to take photos of documents (e.g. KTP, Passport) or the user's face and send it to [GLAIR Vision's API](https://docs.glair.ai) for OCR & liveness detection.
