function getTextWidth(text, font) {
  // re-use canvas object for better performance
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

function getCssStyle(element, prop) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(el = document.body) {
const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
const fontSize = getCssStyle(el, 'font-size') || '16px';
const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';

return `${fontWeight} ${fontSize} ${fontFamily}`;
}

export default {getTextWidth, getCanvasFont};