import React from 'react';

import * as d3 from 'd3';

export interface Props {
  width: number;
  height: number;
  min: number;
  max: number;

  colorScale: any;
}

export const ColorSpectrum: React.FC<Props> = ({ width, height, colorScale, min, max }) => {
  const stepSize = 5;

  const positionRange = d3.range(0, width, stepSize);

  // Map pixel to value.
  const valueScale = d3
    .scaleLinear()
    .domain([0, width])
    .range([min, max]);

  return (
    <g>
      {positionRange.map(pos => {
        return <rect x={pos} width={stepSize} height={height} fill={colorScale(valueScale(pos))} />;
      })}
    </g>
  );
};
