import React from 'react';
import * as d3 from 'd3';
import { DisplayProcessor } from '@grafana/data';
import { makeColorScale } from '../colors';

interface Props {
  scheme: string;
  width: number;
  height: number;
  min: number;
  max: number;
  display: DisplayProcessor;
}

/**
 * Legend with a color spectrum mapped between a minimum and a maximum value.
 */
export const SpectrumLegend: React.FC<Props> = ({ scheme, width, height, min, max, display }) => {
  const colorScale = makeColorScale(scheme, 0, width);

  const legendHeight = 20;
  const spectrumHeight = height - legendHeight;

  return (
    <g>
      <g transform={`translate(0, ${spectrumHeight})`}>
        <Axis width={width} min={min} max={max} display={display} />
      </g>
      <Spectrum width={width} height={spectrumHeight} colorScale={colorScale} />
    </g>
  );
};

interface AxisProps {
  width: number;
  min: number;
  max: number;
  display: DisplayProcessor;
}

/**
 * Horizontal axis describing the color spectrum.
 */
const Axis: React.FC<AxisProps> = ({ width, min, max, display }) => {
  const scale = d3
    .scaleLinear()
    .domain([min, max])
    .range([0, width]);

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
};

interface SpectrumProps {
  width: number;
  height: number;
  colorScale: any;
}

/**
 * A color spectrum.
 */
const Spectrum: React.FC<SpectrumProps> = ({ width, height, colorScale }) => {
  const rangeStep = Math.floor(width / 50);
  const positionRange = d3.range(0, width, rangeStep);

  return (
    <g>
      {positionRange.map(p => {
        const remaining = width - p;
        const spectrumWidth = remaining < rangeStep ? remaining : rangeStep;

        return <rect x={p} y={0} width={spectrumWidth} height={height} fill={colorScale(p)} />;
      })}
    </g>
  );
};
