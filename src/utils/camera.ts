// @ts-nocheck
import { Ref } from "lit/directives/ref";

export function getScreenshot(ref: Ref<Element>) {
  const canvas = getCanvas(ref);
  console.log(canvas && canvas.toDataURL("image/jpeg", 0.92));
  return canvas && canvas.toDataURL("image/jpeg", 0.92);
}

function getCanvas(ref: Ref<Element>) {
  let canvasWidth = 480;
  let canvasHeight = 480;

  let canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  let ctx = canvas.getContext("2d");

  console.log("getCanvas draw");

  if (ctx && canvas && ref !== null && ref.value !== undefined) {
    ctx.drawImage(ref.value, 0, 0, canvas.width, canvas.height);
  }

  console.log("getCanvas done draw");

  return canvas;
}
