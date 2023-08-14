import { ScreenshotArea } from "../components/webcam";

interface ScreenshotProps {
  ref: HTMLVideoElement;
  width: number;
  height: number;
  mirrored?: boolean;
  screenshotArea: ScreenshotArea;
}

export function getScreenshot(props: ScreenshotProps) {
  const canvas = getCanvas(props);
  return canvas && canvas.toDataURL("image/jpeg", 0.92);
}

function getCanvas(props: ScreenshotProps) {
  const {
    ref,
    width = 480,
    height = 480,
    mirrored = false,
    screenshotArea,
  } = props;

  let canvasWidth = (width * screenshotArea.width) / 100;
  let canvasHeight = (height * screenshotArea.height) / 100;

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

      const canvasAspectRatio = width / height;
      const videoAspectRatio = ref.videoWidth / ref.videoHeight;

      if (canvasAspectRatio > videoAspectRatio) {
        takeWidth = ref.videoWidth;
        takeHeight = ref.videoWidth * (1 / canvasAspectRatio);
        translateX = 0;
        translateY = (ref.videoHeight - takeHeight) / 2;
      } else {
        takeWidth = ref.videoHeight * canvasAspectRatio;
        takeHeight = ref.videoHeight;
        translateX = (ref.videoWidth - takeWidth) / 2;
        translateY = 0;
      }

      const getScreenshotArea = () => {
        translateX =
          translateX + Math.round((screenshotArea.x / 100) * takeWidth);
        translateY =
          translateY + Math.round((screenshotArea.y / 100) * takeHeight);
        takeWidth = (takeWidth * screenshotArea.width) / 100;
        takeHeight = (takeHeight * screenshotArea.height) / 100;

        if (mirrored) {
          translateX = ref.videoWidth - (translateX + takeWidth);
        }

        return {
          takeWidth,
          takeHeight,
          translateX,
          translateY,
        };
      };

      ({ takeWidth, takeHeight, translateX, translateY } = getScreenshotArea());

      return {
        takeWidth,
        takeHeight,
        translateX,
        translateY,
      };
    };

    const { takeWidth, takeHeight, translateX, translateY } =
      getCenterImageFromWebcam();

    // See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
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
    if (mirrored) {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
  }

  return canvas;
}
