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
  let aspectRatio: number;

  let canvas = document.createElement("canvas");

  const setCanvasSize = () => {
    const MAX_LANDSCAPE_ASPECT_RATIO = 4 / 3;
    const MAX_PORTRAIT_ASPECT_RATIO = 3 / 4;

    if (canvasWidth / canvasHeight > MAX_LANDSCAPE_ASPECT_RATIO) {
      aspectRatio = MAX_LANDSCAPE_ASPECT_RATIO;
      canvas.width = canvasHeight * aspectRatio;
      canvas.height = canvasHeight;
    } else if (canvasWidth / canvasHeight < MAX_PORTRAIT_ASPECT_RATIO) {
      aspectRatio = MAX_PORTRAIT_ASPECT_RATIO;
      canvas.width = canvasHeight * aspectRatio;
      canvas.height = canvasHeight;
    } else {
      aspectRatio = canvasWidth / canvasHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }
  };

  setCanvasSize();

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

      if (ref.videoWidth >= ref.videoHeight) {
        takeWidth = ref.videoHeight * aspectRatio;
        takeHeight = ref.videoHeight;
        translateX = (ref.videoWidth - takeWidth) / 2;
        translateY = 0;
      } else {
        takeWidth = ref.videoWidth;
        takeHeight = ref.videoWidth / aspectRatio;
        translateX = 0;
        translateY = (ref.videoHeight - takeHeight) / 2;
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
      canvas.width,
      canvas.height
    );

    // invert mirroring
    if (props.mirrored) {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
  }

  return canvas;
}
