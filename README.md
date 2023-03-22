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

# Composable Web Component

This is a way for you to customize smaller GLAIR Web Components. You can customize the whole component or just some parts of GLARI Web Components.

## GLAIR Passive Liveness Web Components

### Description

This component will display GLAIR Passive Liveness. Can be called by using code below inside html

```html
<glair-passive-liveness></glair-passive-liveness>
```

### Partial Customization

You can change the component partially with more description below.

E.g: You can change the default title for the instruction by changing only the title for instruction. The rest of the component will still be _shown as usual_.

```html
<glair-passive-liveness>
  <div slot="instruction">
    <div slot="title">Click Camera Button</div>
  </div>
</glair-passive-liveness>
```

### Whole Customization

You just need to combine all customization to whole customization.

### Passive Liveness Composable Component

This section will describe the whole `<glair-passive-liveness>` component

`<glair-passive-liveness>` consist of three children components:

#### Webcam

1. This is the component that display webcam, hint overlay and the used image for verification after verification completed
1. This is located on upper position
1. To change this view, you need to specify `slot="webcam"` property on the child component inside `<glair-passive-liveness>`
1. You can only change the whole webcam component
1. It's not recommended to change this component because it's link with `<instruction-view>` button to take picture and it's a neutral component with no identifier

```html
<glair-passive-liveness>
  <custom-webcam slot="webcam"></custom-webcam>
</glair-passive-liveness>
```

#### Instruction

1. This is the component that display instruction's title, take photo button and additional text
1. This is located on lower position
1. To change this view, you need to specify `slot="instruction"` property on the child component inside `<glair-passive-liveness>`
1. Consist of three children components
1. Title
   1. This is the component that display title text
   1. Default value: `Take photo`
   1. This is located on the top position
   1. Can be changed by using `slot="title"` property on the child component inside component with `slot="instruction"`
1. Screenshot Button
   1. This is the component that display icon to capture image
   1. Default value: `Camera Icon Image`
   1. This is located on the middle position
   1. Can be changed by using `slot="screenshot"` property on the child component inside component with `slot="instruction"`
   1. This component will automatically has `onclick` attribute to take screenshot
1. Additional Description
   1. This is the component that display additional description text
   1. Default value: `Make sure your face is clearly visible on the marked area`
   1. This is located on the bottom position
   1. Can be changed by using `slot="additional"` property on the child component inside component with `slot="instruction"`

```html
<glair-passive-liveness>
  <div slot="instruction">
    <div slot="title">Custom Title</div>
    <div slot="screenshot"><img /></div>
    <div slot="additional">Custom description</div>
  </div>
</glair-passive-liveness>
```

#### Result

1. This is the component that display result's content
1. This is located after taking photo and verification process
1. To change this view, you need to specify `slot="result"` property on the child component inside `<glair-passive-liveness>`
1. Consist of two children components
1. Success
   1. This is the component that display success content
   1. Can be changed by using `slot="success"` property on the child component inside component with `slot="result"`
   1. Consist of five children components
   1. Title
      1. Display title text
      1. Default value: `Liveness Verification Successful`
      1. Located on the top position
      1. Can be changed by using `slot="title"` property on the child component inside component with `slot="success"`
   1. Icon
      1. Display success icon
      1. Default value: `Success Icon Image`
      1. Located directly below Title
      1. Can be changed by using `slot="icon"` property on the child component inside component with `slot="success"`
   1. Additional Description
      1. Display success additional description
      1. Default value: `Successfully verified as a real person`
      1. Located directly below Icon
      1. Can be changed by using `slot="additional"` property on the child component inside component with `slot="success"`
   1. Button
      1. Display button
      1. Default value: `CONTINUE`
      1. Located directly below Additional Description
      1. Has `type` property to indicate
      1. Value `override`: override the whole button
      1. Value `text`: only override the button's text
      1. Remember to put `onclick` property
      1. Can be changed by using `slot="button"` property on the child component inside component with `slot="success"`
   1. Footer
      1. Display footer
      1. Default value: `Powered by GLAIR`
      1. Located on the bottom position
      1. Can be changed by using `slot="footer"` property on the child component inside component with `slot="success"`
1. Failure
   1. This is the component that display failure content
   1. Can be changed by using `slot="failure"` property on the child component inside component with `slot="result"`
   1. Consist of five children components
   1. Title
      1. Display title text
      1. Default value: `Liveness Verification Failed`
      1. Located on the top position
      1. Can be changed by using `slot="title"` property on the child component inside component with `slot="failure"`
   1. Icon
      1. Display failure icon
      1. Default value: `Failure Icon Image`
      1. Located directly below Title
      1. Can be changed by using `slot="icon"` property on the child component inside component with `slot="failure"`
   1. Additional Description
      1. Display failure additional description
      1. Default value: `Cannot identified as a real person`
      1. Located directly below Icon
      1. Can be changed by using `slot="additional"` property on the child component inside component with `slot="failure"`
   1. Retry Button
      1. Display retry button
      1. Default value: `TRY AGAIN`
      1. Located directly below Additional Description
      1. Has `type` property to indicate
      1. Value `override`: override the whole button
      1. Value `text`: only override the button's text
      1. `onclick` property can't be changed
      1. Can be changed by using `slot="button-retry"` property on the child component inside component with `slot="failure"`
   1. Cancel Button
      1. Display cancel button
      1. Default value: `CANCEL`
      1. Located directly below Retry Button
      1. Has `type` property to indicate
      1. Value `override`: override the whole button
      1. Value `text`: only override the button's text
      1. Remember to put `onclick` property
      1. Can be changed by using `slot="button-cancel"` property on the child component inside component with `slot="failure"`
   1. Footer
      1. Display footer
      1. Default value: `Powered by GLAIR`
      1. Located on the bottom position
      1. Can be changed by using `slot="footer"` property on the child component inside component with `slot="failure"`

```html
<glair-passive-liveness>
  <div slot="result">
    <div slot="success">
      <div slot="title">New Title</div>
      <img slot="icon"></div>
      <div slot="additional">Custom Additional</div>
      <button slot="button" type="override" onclick="">Custom Button</button>
      <div slot="footer">Custom Footer</div>
    </div>
    <div slot="failure">
      <div slot="title">New Title</div>
      <img slot="icon"></div>
      <div slot="additional">Custom Additional</div>
      <button slot="button-retry" type="text">Custom Retry Button</button>
      <button slot="button-cancel" type="text" onclick="">Custom Cancel Button</button>
      <div slot="footer">Custom Footer</div>
    </div>
  </div>
</glair-passive-liveness>
```

## GLAIR Webcam

### Description

This is a webcam component to display webcam stream with common frame overlay to help pointing face's placement

```html
<glair-webcam></glair-webcam>
```

### GLAIR Webcam Composable Component

This section will describe the whole `<glair-webcam>` component

`<glair-webcam>` consist of one children components:

#### Overlay

1. This is the component that display webcam overlay
1. This is located floating on the webcam
1. To change this view, you need to specify `slot="overlay"` property on the child component inside `<glair-webcam>`

```html
<glair-webcam>
  <img slot="overlay" />
</glair-webcam>
```

### GLAIR Webcam Component Detail

At current moment, components that used `<glair-webcam>` need to create a `reference` property and connect the `reference` to `<glair-webcam>` to be able to trigger `onscreenshot` event. For example, `<glair-passive-liveness>` use default `<glair-webcam>` like

```js
export class GlairPassiveLiveness extends Element {
  @state()
  cameraRef = createRef();

  return (
    <div>
      <glair-webcam
        .videoEl=${cameraRef}
      ></glair-webcam>
    </div>
  ;)
}
```

### Future Development

1. Update `<glair-webcam>` to be more robust by using custom event to trigger and pass video stream object
