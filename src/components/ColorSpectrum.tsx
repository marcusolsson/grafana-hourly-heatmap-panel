import React from 'react';

import * as d3 from 'd3';
import { Quality } from '../types';

export interface Props {
  width: number;
  height: number;
  min: number;
  max: number;

  colorDisplay: (value: number) => string;
  currentValue?: number;
  indicator: boolean;
  quality: Quality;
}

/**
 * ColorSpectrum draws a SVG color spectrum using a given color scale.
 *
 * TODO: The current implementation subdivides the spectrum into individual SVG
 * elements. To get a perfect gradient on a high DPI screen, this can degrade
 * the performance of the panel. Is there a way to get a smooth gradient using
 * CSS, using only a single rectangle?
 */
export const ColorSpectrum: React.FC<Props> = React.memo(
  ({ width, height, colorDisplay, min, max, currentValue, indicator, quality }) => {
    const calculateStepSize = (quality: Quality): number => {
      switch (quality) {
        case 'high':
          return Math.ceil(1);
        case 'medium':
          return Math.ceil(width / 40);
        case 'low':
          return Math.ceil(width / 20);
      }
    };

    const stepSize = calculateStepSize(quality);

    // Divide the spectrum into segments of equal size.
    const positionRange = d3.range(0, width, stepSize);

    // Map a X coordinate to a value between min and max.
    const toValueScale = d3.scaleLinear().domain([0, width]).range([min, max]);

    const fromValueScale = d3.scaleLinear().domain([min, max]).range([0, width]);

    return (
      <>
        {indicator && currentValue ? (
          <g transform={`translate(${fromValueScale(currentValue)}, -7)`}>
            <polygon points="-5,0 5,0 0,7" style={{ fill: 'white' }} />
          </g>
        ) : null}

        <g>
          {positionRange.map((pos, i) => {
            const cellSize = pos + stepSize > width ? width - pos : stepSize;
            return (
              <rect key={i} x={pos} width={cellSize} height={height} fill={colorDisplay(toValueScale(pos) ?? 0)} />
            );
          })}
        </g>
      </>
    );
  }
);
ColorSpectrum.displayName = 'ColorSpectrum';
