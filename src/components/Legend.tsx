import React from 'react';

import { DisplayProcessor } from '@grafana/data';
import { ColorSpectrum } from './ColorSpectrum';
import { LegendAxis } from './LegendAxis';

interface LegendProps {
  width: number;
  height: number;
  min: number;
  max: number;
  display: DisplayProcessor;
  colorScale: any;
}

/**
 * Legend with a color spectrum mapped between a minimum and a maximum value.
 */
export const Legend: React.FC<LegendProps> = ({ width, height, min, max, display, colorScale }) => {
  const legendHeight = 20;
  const spectrumHeight = height - legendHeight;

  return (
    <g>
      <g transform={`translate(0, ${spectrumHeight})`}>
        <LegendAxis width={width} min={min} max={max} display={display} />
      </g>
      <ColorSpectrum width={width} height={spectrumHeight} colorScale={colorScale} min={min} max={max} />
    </g>
  );
};
