interface ScreenshotProps {
  ref: HTMLVideoElement;
  width: number;
  height: number;
  mirrored?: boolean;
}

export function getScreenshot(props: ScreenshotProps) {
  const canvas = getCanvas(props);
  return canvas && canvas.toDataURL("image/jpeg", 0.92);
}

function getCanvas(props: ScreenshotProps) {
  const { ref, width = 480, height = 480, mirrored = false } = props;

  let canvasWidth = width;
  let canvasHeight = height;

  let canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  let ctx = canvas.getContext("2d");

  if (ctx && canvas) {
    // mirror the screenshot
    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // https://www.w3schools.com/tags/canvas_drawimage.asp
    if (canvas.width === canvas.height) {
      if (ref.videoWidth > ref.videoHeight) {
        ctx.drawImage(
          ref,
          (ref.videoWidth - ref.videoHeight) / 2,
          0,
          ref.videoHeight,
          ref.videoHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        ctx.drawImage(
          ref,
          0,
          (ref.videoHeight - ref.videoWidth) / 2,
          ref.videoWidth,
          ref.videoWidth,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    } else {
      ctx.drawImage(ref, 0, 0, canvas.width, canvas.height);
    }

    // invert mirroring
    if (props.mirrored) {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
  }

  return canvas;
}
