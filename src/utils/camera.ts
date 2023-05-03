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

    const getCenterImageFromWebcam = () => {
      let takeWidth: number;
      let takeHeight: number;
      let translateX: number;
      let translateY: number;

      if (canvasWidth / canvasHeight - ref.videoWidth / ref.videoHeight > 0) {
        takeWidth = ref.videoWidth;
        takeHeight = (ref.videoWidth * canvasHeight) / canvasWidth;
        translateX = 0;
        translateY = (ref.videoHeight - takeHeight) / 2;
      } else {
        takeWidth = (canvasWidth / canvasHeight) * ref.videoHeight;
        takeHeight = ref.videoHeight;
        translateX = (ref.videoWidth - takeWidth) / 2;
        translateY = 0;
      }

      return {
        takeWidth,
        takeHeight,
        translateX,
        translateY,
      };
    };

    const { takeWidth, takeHeight, translateX, translateY } =
      getCenterImageFromWebcam();

    ctx.drawImage(
      ref,
      translateX,
      translateY,
      takeWidth,
      takeHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    // invert mirroring
    if (props.mirrored) {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
  }

  return canvas;
}
