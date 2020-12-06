import React from 'react';

import * as d3 from 'd3';

export interface Props {
  width: number;
  height: number;
  min: number;
  max: number;

  colorDisplay: (value: number) => string;
  currentValue?: number;
  indicator: boolean;
}

/**
 * ColorSpectrum draws a SVG color spectrum using a given color scale.
 */
export const ColorSpectrum: React.FC<Props> = ({ width, height, colorDisplay, min, max, currentValue, indicator }) => {
  const stepSize = Math.ceil(1);

  // Divide the spectrum into segments of equal size.
  const positionRange = d3.range(0, width, stepSize);

  // Map a X coordinate to a value between min and max.
  const toValueScale = d3
    .scaleLinear()
    .domain([0, width])
    .range([min, max]);

  const fromValueScale = d3
    .scaleLinear()
    .domain([min, max])
    .range([0, width]);

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
          return <rect key={i} x={pos} width={cellSize} height={height} fill={colorDisplay(toValueScale(pos))} />;
        })}
      </g>
    </>
  );
};
