import { DisplayProcessor } from '@grafana/data';
import React from 'react';
import { Quality } from '../types';
import { ColorSpectrum } from './ColorSpectrum';
import { LegendAxis } from './LegendAxis';

interface LegendProps {
  width: number;
  height: number;
  min: number;
  max: number;
  valueDisplay: DisplayProcessor;
  colorDisplay: (value: number) => string;
  currentValue?: number;
  indicator: boolean;
  quality: Quality;
}

/**
 * Legend with a color spectrum mapped between a minimum and a maximum value.
 */
export const Legend: React.FC<LegendProps> = React.memo(
  ({ width, height, min, max, valueDisplay: display, colorDisplay, currentValue, indicator, quality }) => {
    const legendHeight = 20;
    const spectrumHeight = height - legendHeight;

    return (
      <g>
        <g transform={`translate(0, ${spectrumHeight})`}>
          <LegendAxis width={width} min={min} max={max} display={display} />
        </g>
        <ColorSpectrum
          currentValue={currentValue}
          width={width}
          height={spectrumHeight}
          colorDisplay={colorDisplay}
          min={min}
          max={max}
          indicator={indicator}
          quality={quality}
        />
      </g>
    );
  }
);
Legend.displayName = 'Legend';
