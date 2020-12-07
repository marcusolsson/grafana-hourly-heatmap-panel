/**
 * measureText returns the width of a string in pixels.
 *
 * @param text to measure
 */
export const measureText = (text: string): number => {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = '14px Arial';
    return ctx.measureText(text).width;
  }
  return 0;
};
