import React from 'react';
import * as d3 from 'd3';
import { DisplayProcessor } from '@grafana/data';

interface LegendAxisProps {
  width: number;
  min: number;
  max: number;
  display: DisplayProcessor;
}

/**
 * Horizontal axis describing the color spectrum.
 */
export const LegendAxis: React.FC<LegendAxisProps> = React.memo(({ width, min, max, display }) => {
  const scale = d3.scaleLinear().domain([min, max]).range([0, width]);

  const preferredTickWidth = 50;
  const ratio = width / preferredTickWidth;

  const axis = d3
    .axisBottom(scale)
    .ticks(Math.round(ratio))
    .tickFormat((d: any) => {
      const val = display(d);
      return `${val.text}${val.suffix ? val.suffix : ''}`;
    });

  return <g ref={(node: any) => d3.select(node).call(axis)} />;
});
LegendAxis.displayName = 'LegendAxis';
