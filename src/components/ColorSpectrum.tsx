import React from 'react';

import * as d3 from 'd3';

export interface Props {
  width: number;
  height: number;
  min: number;
  max: number;

  colorScale: any;
}

/**
 * ColorSpectrum draws a SVG color spectrum using a given color scale.
 */
export const ColorSpectrum: React.FC<Props> = ({ width, height, colorScale, min, max }) => {
  const stepSize = Math.ceil(width / 20);

  // Divide the spectrum into segments of equal size.
  const positionRange = d3.range(0, width, stepSize);

  // Map a X coordinate to a value between min and max.
  const valueScale = d3
    .scaleLinear()
    .domain([0, width])
    .range([min, max]);

  return (
    <g>
      {positionRange.map((pos, i) => {
        const cellSize = pos + stepSize > width ? width - pos : stepSize;
        return <rect key={i} x={pos} width={cellSize} height={height} fill={colorScale(valueScale(pos))} />;
      })}
    </g>
  );
};
