import React, { useState, useMemo } from 'react';
import { TimeRange, Field, ThresholdsMode, ThresholdsConfig } from '@grafana/data';

import { bucketize } from '../bucket';
import { makeSpectrumColorScale, makeCustomColorScale } from '../colors';
import { TimeRegion } from './TimeRegionEditor';
import { Quality } from '../types';

import { HeatmapWithAxes } from './HeatmapWithAxes';
import { Legend } from './Legend';

interface ChartProps {
  width: number;
  height: number;

  legend: boolean;
  cellBorder: boolean;
  showValueIndicator: boolean;
  legendGradientQuality: Quality;
  timeField: Field<number>;
  valueField: Field<number>;
  timeZone: string;
  timeRange: TimeRange;
  dailyIntervalHours: [number, number];
  regions: TimeRegion[];
  tooltip: boolean;
}

/**
 * A Chart contains the heatmap chart and optional legend. It's
 * main purpose is to enable stacked heatmaps for when the data query contains
 * multiple data frames.
 */
export const Chart: React.FC<ChartProps> = ({
  width,
  height,
  legend,
  timeField,
  valueField,
  timeZone,
  timeRange,
  dailyIntervalHours,
  regions,
  showValueIndicator,
  cellBorder,
  legendGradientQuality,
  tooltip,
}) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>();

  // Create a histogram for each day. This builds the main data structure that
  // we'll use for the heatmap visualization.
  const bucketData = useMemo(() => bucketize(timeField, valueField, timeZone, timeRange, dailyIntervalHours), [
    timeField,
    valueField,
    timeZone,
    timeRange,
    dailyIntervalHours,
  ]);

  const colorMapper = buildColorMapper(valueField);

  // Calculate dimensions for the legend.
  const legendPadding = { top: 10, left: 35, bottom: 0, right: 10 };
  const legendWidth = width - (legendPadding.left + legendPadding.right);
  const legendHeight = 40;

  // Heatmap expands to fill any space not used by the legend.
  const heatmapPadding = { top: 0, left: 0, bottom: 0, right: legendPadding.right };
  const heatmapWidth = width - (heatmapPadding.left + heatmapPadding.right);
  const heatmapHeight =
    height -
    (heatmapPadding.top + heatmapPadding.bottom) -
    (legend ? legendHeight + legendPadding.top + legendPadding.bottom : 0.0);

  const heatmapPos = { x: heatmapPadding.left, y: heatmapPadding.top };
  const legendPos = {
    x: legendPadding.left,
    y: heatmapPadding.top + heatmapHeight + heatmapPadding.bottom + legendPadding.top,
  };

  const onHeatmapHover = (value?: number) => {
    setHoverValue(value);
  };

  return (
    <>
      <g transform={`translate(${heatmapPos.x}, ${heatmapPos.y})`}>
        <HeatmapWithAxes
          data={bucketData}
          width={heatmapWidth}
          height={heatmapHeight}
          colorDisplay={colorMapper}
          timeZone={timeZone}
          timeRange={timeRange}
          dailyInterval={dailyIntervalHours}
          regions={regions}
          onHover={onHeatmapHover}
          cellBorder={cellBorder}
          tooltip={tooltip}
        />
      </g>

      {legend ? (
        <g transform={`translate(${legendPos.x}, ${legendPos.y})`}>
          <Legend
            width={legendWidth}
            height={legendHeight}
            min={valueField.config.min!}
            max={valueField.config.max!}
            valueDisplay={valueField.display!}
            colorDisplay={colorMapper}
            currentValue={hoverValue}
            indicator={showValueIndicator}
            quality={legendGradientQuality}
          />
        </g>
      ) : null}
    </>
  );
};

/**
 * makeColorDisplay returns a function that maps a value to a color.
 *
 * @param field from which the colors are configured
 */
const buildColorMapper = (field: Field<number>): ((value: number) => string) => {
  const customFieldOptions = field.config.custom;
  const colorPalette = customFieldOptions.colorPalette;
  const invertPalette = customFieldOptions.invertPalette;
  const nullValueColor = customFieldOptions.nullValueColor;
  const colorSpace = customFieldOptions.colorSpace;
  const colorThresholds: ThresholdsConfig = customFieldOptions.thresholds ?? {
    mode: ThresholdsMode.Percentage,
    steps: [],
  };

  // Create the scales we'll be using to map values to colors.
  const customColorScale = makeCustomColorScale(colorSpace, field.config.min!, field.config.max!, colorThresholds);
  const spectrumColorScale = makeSpectrumColorScale(colorPalette, field.config.min!, field.config.max!, invertPalette);

  return (value: number): string => {
    switch (colorPalette) {
      case 'custom':
        return customColorScale(value) ?? nullValueColor;
      case 'fieldOptions':
        return field.display!(value).color!;
      default:
        return spectrumColorScale(value) ?? nullValueColor;
    }
  };
};
