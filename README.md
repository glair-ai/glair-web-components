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
| [Webcam](#webcam)                     | `<glair-webcam>`           | `/standalone/glair-webcam`     | `lib/glair-webcam`      |
| [Passive Liveness](#passive-liveness) | `<glair-passive-liveness>` | `/standalone/passive-liveness` | `/lib/passive-liveness` |
| [Active Liveness](#active-liveness)   | _in development_           | _in development_               | _in development_        |

---

## Webcam

This component provides you an easier access for webcam. The aspect ratio will be 1:1. You don't have to manually set the width and height as it will be automatically adjusted using this algorithm: `Math.min(window.innerHeight, window.innerWidth, 480)`. Under the hood, the component listens to `resize` event.

### Attributes

| Name         | Type                                              | Default Value | Notes                                                                                                                                                  |
| ------------ | ------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `facingMode` | Corresponds to `MediaTrackConstraints.facingMode` | `user`        | Set to `environment` to use rear camera. See [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode) for detail. |
| `mirrored`   | Set to true to mirror the image                   | `false`       | `lib/glair-webcam`                                                                                                                                     |

### Methods

| Method signature | Return Value    | Description                                  |
| ---------------- | --------------- | -------------------------------------------- |
| `screenshot()`   | `Promise<Blob>` | Screenshot the current image shown on webcam |

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

# Web Components API

This section contain all details about GLAIR Web Components

## Composable Web Components

This is a way for you to customize GLAIR Web Components. You can customize the whole component or just some parts of GLAIR Web Components.

### Partial Customization

You can change the component partially with more description below.

E.g: You can change the default title for the instruction by changing only the title for instruction. The rest of the component will still be _shown as usual_.

```html
<glair-passive-liveness>
  <glair-instruction slot="instruction">
    <div slot="title">Click Camera Button</div>
  </glair-instruction>
</glair-passive-liveness>
```

### Whole Customization

You can also change the whole component by replacing the highest `slot` element.

## Passive Liveness Web Component

### Description

This component will display GLAIR Passive Liveness. This is a page that display a combination of GLAIR Liveness Hint, GLAIR Webcam, GLAIR Instruction and GLAIR Result

Here are some code samples on how to use `<glair-passive-liveness>`

1. Use only `<glair-passive-liveness`

   ```html
   <!-- v1 -->
   <glair-passive-liveness></glair-passive-liveness>
   ```

1. Customize some part inside `<glair-passive-liveness>`

   Must specify `slot` to change the relevant component

   ```html
   <!-- v2 -->
   <glair-passive-liveness>
     <glair-liveness-hint slot="liveness-hint">
       <div slot="heading">Custom Heading</div>
     </glair-liveness-hint>
   </glair-passive-liveness>
   ```

1. Use only `<glair-passive-liveness>`'s building components.

   There is no need to specify `slot`

   ```html
   <!-- v3 -->
   <div>
     <glair-liveness-hint></glair-liveness-hint>
     <glair-webcam></glair-webcam>
     <glair-instruction></glair-instruction>
     <glair-result></glair-result>
   </div>
   ```

### Passive Liveness Composable Components

`<glair-passive-liveness>` consist of four children components that are composable:

1. `<glair-liveness-hint>`, can be changed by specifying `slot="liveness-hint"`
1. `<glair-webcam>`, can be changed by specifying `slot="webcam"`
1. `<glair-instruction>`, can be changed by specifying `slot="instruction"`
1. `<glair-result>`, can be changed by specifying `slot="result"`

## Liveness Hint

### Description

This component will display GLAIR Liveness Hint as popup in the middle of the page. This a component that display hints icon and description before doing the liveness.

Here are some code samples on how to use `<glair-liveness-hint>`

```html
<glair-liveness-hint></glair-liveness-hint>
```

### State

`<glair-liveness-hint>` contains one state:

1. **show**:
   1. Specify display whether to show popup
   1. Default: `true`

### Liveness Hint Composable Components

`<glair-liveness-hint>` consist of four children components that are composable:

1. Heading
   1. This is the component that display heading description
   1. Default value: `To ease the verification process, please make sure`
   1. This is located on the top position
   1. Can be changed by using `slot="heading"` property on the child component inside `liveness-hint`
1. Hint Container
   1. This is to change hint details container with all its content
   1. Default value: Contain 4 hint details with each icons
   1. This is located on the middle position
   1. Can be changed by using `slot="hint-container"` property on the child component inside `liveness-hint`
1. Specific Hint
   1. This is to change the content of specific hint details
   1. Default value: Contain icon and description text
   1. This is located on the middle position
   1. Can be changed by using `slot="hint-[number]"` property on the child component inside `liveness-hint`, with `[number]` from 1 - 4.
   1. Details:
      1. `slot="hint-1"` for the first hint detail
      1. `slot="hint-2"` for the second hint detail
      1. `slot="hint-3"` for the third hint detail
      1. `slot="hint-4"` for the fourth hint detail
1. Button Text
   1. This is the liveness hint button text
   1. Default value: `START`
   1. This is located on the bottom position
   1. Can be changed by using `slot="button-text"` property on the child component inside `liveness-hint`

```html
<glair-liveness-hint>
  <span slot="heading">Custom Heading</span>
  <span slot="button-text">Custom Button Text</span>
</glair-liveness-hint>
```

## Webcam

### Description

This component will display GLAIR Webcam. This component contain video stream, video controller and video overlay helper.

Here are some code samples on how to use `<glair-webcam>`

```html
<glair-webcam></glair-webcam>
```

### State

`<glair-webcam>` contains of a few states:

1. **isCameraAllowed**:
   1. Specify display whether to show require permission popup
   1. Default: `false`
1. **loading**:
   1. Specify display whether to show loading popup
   1. Default: `false`

### Property

`<glair-webcam>` contains of a few properties:

1. **mirrored**:
   1. Specify webcam need to be flip horizontally
   1. Default: `false`
1. **width**:
   1. Specify the width of the webcam
   1. Default: `480` px
1. **height**:
   1. Specify the height of the webcam
   1. Default: `480` px
1. **facingMode**:
   1. Specify webcam which camera to used
   1. Default: `user`

### Custom Event

`<glair-webcam>` contains two event listeners:

1. `onTriggerScreenshot`

   1. Listen to `onTriggerScreenshot`
   1. Dispatch one custom event named `onScreenshot` with blob image inside `event.detail`
   1. Also change state `loading` to `true`

1. `onRetry`
   1. Listen to `onRetry`
   1. Change state `loading` to `false`

`<glair-webcam>` contains one event dispatcher:

1. `onScreenshot`:
   1. Dispatch custom event with an image as the content inside `event.detail`
   1. This event is dispatched after event `onTriggerScreenshot`

### Webcam Composable Components

There is no composable components inside GLAIR webcam

## Instruction

### Description

This component will display GLAIR Instruction. This component contains title, take picture button, additional description and loading view

Here are some code samples on how to use `<glair-instruction>`

```html
<glair-instruction></glair-instruction>
```

### State

`<glair-instruction>` contains one state:

1. **loading**:
   1. Specify display whether to show loading view
   1. Default: `false`

### Custom Event

`<glair-instruction>` contains two event listeners:

1. `onTriggerScreenshot`
   1. Listen to `onTriggerScreenshot`
   1. Change state `loading` to `true`
1. `onRetry`
   1. Listen to `onRetry`
   1. Change state `loading` to `false`

`<glair-instruction>` contains one event dispatcher:

1. `onTriggerScreenshot`
   1. Dispatch event with no content to signal webcam to create screenshot
   1. This is dispatched by instruction's button

### Instruction Composable Components

`<glair-instruction>` consist of three children components that are composable:

1. Loading Text
   1. This is the component that display loading description
   1. Default value: `Verification is in progress`
   1. This is located below loading icon in loading state
   1. Can be changed by using `slot="loading-text"` property on the child component inside `instruction`
1. Title
   1. This is the component that display title text
   1. Default value: `Take photo`
   1. This is located on the top in not loading state
   1. Can be changed by using `slot="title"` property on the child component inside `instruction`
1. Additional Description
   1. This is the component that display additional description
   1. Default value: `Make sure your face is clearly visible on the marked area`
   1. This is located below camera icon in not loading state
   1. Can be changed by using `slot="additional"` property on the child component inside `instruction`

```html
<glair-instruction>
  <div slot="title">Custom Title</div>
  <div slot="additional">Custom description</div>
  <div slot="loading-text">Custom Loading</div>
</glair-instruction>
```

## Result

### Description

This component will display GLAIR Result. This component contains success and failure page

Here are some code samples on how to use `<glair-result>`

```html
<glair-result></glair-result>
```

### Property

`<glair-result>` contains three properties:

1. **show**
   1. Specify view to display
      1. `success view`, if value is `success`
      1. `failure view`, if value is `failure`
      1. `nothing`, if value is not above two string
   1. Default: empty string
1. **successUrl**
   1. Specify url to open after liveness is done successfully
   1. Default: empty string
1. **cancelUrl**
   1. Specify url to open after liveness is cancelled
   1. Default: empty string

### Custom Event

`<glair-result>` contains one event listener:

1. `onRetry`
   1. Listen to `onRetry`
   1. Change state `show` to nothing

### Result Composable Components

`<glair-result>` consist of three children components that are composable:

1.  Success View

    1. This is the component that display success view
    1. Default value: `<glair-success-view>`
    1. Can be changed by using `<glair-success-view slot="success">` on the child component inside component `result`
    1. Consist of four children components
       1. Title
          1. Display title text
          1. Default value: `Liveness Verification Successful`
          1. Located on the top position
          1. Can be changed by using `slot="title"` property on the child component inside component with `success`
       1. Icon
          1. Display success icon
          1. Default value: `Success Icon Image`
          1. Located directly below Title
          1. Can be changed by using `slot="icon"` property on the child component inside component with `success`
       1. Additional Description
          1. Display success additional description
          1. Default value: `Successfully verified as a real person`
          1. Located directly below Icon
          1. Can be changed by using `slot="additional"` property on the child component inside component with `success`
       1. Button
          1. Display button
          1. Default text value: `CONTINUE`
          1. Located directly below Additional Description
          1. Can be changed by using `slot="button-text"` property on the child component inside component with `success`

1.  Failure View

    1. This is the component that display failure view
    1. Default value: `<glair-failure-view>`
    1. Can be changed by using `slot="failure"` property on the child component inside component `result`
    1. Consist of five children components
       1. Title
          1. Display title text
          1. Default value: `Liveness Verification Failed`
          1. Located on the top position
          1. Can be changed by using `slot="title"` property on the child component inside component with `failure`
       1. Icon
          1. Display failure icon
          1. Default value: `Failure Icon Image`
          1. Located directly below Title
          1. Can be changed by using `slot="icon"` property on the child component inside component with `failure`
       1. Additional Description
          1. Display failure additional description
          1. Default value: `Cannot identified as a real person`
          1. Located directly below Icon
          1. Can be changed by using `slot="additional"` property on the child component inside component with `failure`
       1. Retry Button
          1. Display retry button
          1. Default text value: `TRY AGAIN`
          1. Located directly below Additional Description
          1. Can be changed by using `slot="button-retry-text"` property on the child component inside component with `failure`
          1. This component also dispatch event named `onRetry` to remove state `loading` on `<glair-instruction>, <glair-webcam>, <glair-result>`
       1. Cancel Button
          1. Display cancel button
          1. Default text value: `CANCEL`
          1. Located directly below Retry Button
          1. Can be changed by using `slot="button-cancel-text"` property on the child component inside component with `failure`

1.  Footer

    1. This is the component that display footer
    1. Default value: `Powered by GLAIR`
    1. Can be change by using `slot="footer"` property on the child component inside component `result`

```html
<glair-result>
  <glair-success-view slot="success">
    <div slot="title">New Success Title</div>
    <div slot="additional">Custom Additional</div>
  </glair-success-view>
  <glair-failure-view slot="failure">
    <div slot="title">New Failure Title</div>
    <div slot="button-retry-text">Custom Retry Button</div>
    <div slot="button-cancel-text">Custom Cancel Button</div>
  </glair-failure-view>
  <div slot="footer">Custom Footer</div>
</glair-result>
```
