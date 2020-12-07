import { config } from '@grafana/runtime';
import { gte } from 'semver';

/**
 * hasCapability returns true if the currently running version of Grafana
 * supports a given feature. Enables graceful degredation for earlier versions
 * that don't support a given capability.
 */
export const hasCapability = (capability: string) => {
  const version = config.buildInfo.version;
  switch (capability) {
    case 'color-scheme':
      return gte(version, '7.3.0');
    default:
      return false;
  }
};

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
