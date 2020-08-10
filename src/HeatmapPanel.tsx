import React from 'react';
import { DataFrame, PanelProps, ThresholdsMode, ThresholdsConfig } from '@grafana/data';

import { bucketize } from './bucket';
import { HeatmapOptions } from './types';
import { makeSpectrumColorScale, makeCustomColorScale } from './colors';

import { HeatmapChart } from './components/HeatmapChart';
import { Legend } from './components/Legend';

interface Props extends PanelProps<HeatmapOptions> {}

/**
 * HeatmapPanel visualizes a heatmap with a histogram for each day along with
 * axes and a legend.
 *
 * A panel is a regular React component that accepts a `Props` that extends
 * `PanelProps`. The `PanelProps` object gives your component access to things
 * like query results, panel options, and the current timezone.
 */
export const HeatmapPanel: React.FC<Props> = ({ options, data, width, height, timeZone }) => {
  // `options` contains the properties defined in the `HeatmapOptions` object.
  const { showLegend, from, to } = options;

  // Parse the extents of hours to display in a day.
  const dailyIntervalHours: [number, number] = [parseFloat(from), to === '0' ? 24 : parseFloat(to)];

  return (
    <svg width={width} height={height}>
      {data.series.map((frame, i) => {
        const segmentHeight = height / data.series.length;

        return (
          <g transform={`translate(0, ${i * segmentHeight})`}>
            <HeatmapContainer
              width={width}
              height={segmentHeight}
              showLegend={showLegend}
              frame={frame}
              timeZone={timeZone}
              dailyIntervalHours={dailyIntervalHours}
            />
          </g>
        );
      })}
    </svg>
  );
};

interface HeatmapContainerProps {
  width: number;
  height: number;

  showLegend: boolean;
  frame: DataFrame;
  timeZone: string;
  dailyIntervalHours: [number, number];
}

/**
 * HeatmapContainer is used to support multiple queries. A HeatmapContainer is
 * created for each query.
 */
export const HeatmapContainer: React.FC<HeatmapContainerProps> = ({
  width,
  height,
  showLegend,
  frame,
  timeZone,
  dailyIntervalHours,
}) => {
  // Create a histogram for each day. This builds the main data structure that
  // we'll use for the heatmap visualization.
  const bucketData = bucketize(frame, timeZone, dailyIntervalHours);

  // Get custom fields options. For now, we use the configuration in the first
  // numeric field in the data frame.
  const fieldConfig = frame.fields.find(field => field.type === 'number')?.config.custom;
  const colorPalette = fieldConfig.colorPalette;
  const invertPalette = fieldConfig.invertPalette;
  const colorSpace = fieldConfig.colorSpace;
  const thresholds: ThresholdsConfig = fieldConfig.thresholds ?? {
    mode: ThresholdsMode.Percentage,
    steps: [],
  };

  // Create the scale we'll be using to map values to colors.
  let scale =
    colorPalette === 'custom'
      ? makeCustomColorScale(colorSpace, bucketData.min, bucketData.max, thresholds)
      : makeSpectrumColorScale(colorPalette, bucketData.min, bucketData.max, invertPalette);

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
    (showLegend ? legendHeight + legendPadding.top + legendPadding.bottom : 0.0);

  return (
    <>
      <g transform={`translate(${heatmapPadding.left}, ${heatmapPadding.top})`}>
        <HeatmapChart
          data={bucketData}
          width={heatmapWidth}
          height={heatmapHeight}
          colorScale={scale}
          timeZone={timeZone}
          dailyInterval={dailyIntervalHours}
        />
      </g>

      {showLegend ? (
        <g
          transform={`translate(${legendPadding.left}, ${heatmapPadding.top +
            heatmapHeight +
            heatmapPadding.bottom +
            legendPadding.top})`}
        >
          <Legend
            width={legendWidth}
            height={legendHeight}
            min={bucketData.min}
            max={bucketData.max}
            display={bucketData.displayProcessor}
            colorScale={scale}
          />
        </g>
      ) : null}
    </>
  );
};
