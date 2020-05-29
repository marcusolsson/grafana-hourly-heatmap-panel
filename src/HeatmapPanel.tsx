import React from 'react';
import { PanelProps, ThresholdsMode, ThresholdsConfig } from '@grafana/data';

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

  // Only get the first series if the query returned more than one.
  const frame = data.series[0];

  // Parse the extents of hours to display in a day.
  const dailyIntervalHours: [number, number] = [parseFloat(from), to === '0' ? 24 : parseFloat(to)];

  // Create a histogram for each day. This builds the main data structure that
  // we'll use for the heatmap visualization.
  const bucketData = bucketize(frame, timeZone, dailyIntervalHours);

  // Get custom fields options. For now, we use the configuration in the first
  // numeric field in the data frame.
  const fieldConfig = frame.fields.find(field => field.type === 'number')?.config.custom;
  const colorScheme = fieldConfig.colorScheme;
  const colorSpace = fieldConfig.colorSpace;
  const thresholds: ThresholdsConfig = fieldConfig.thresholds || {
    mode: ThresholdsMode.Percentage,
    steps: [],
  };

  // Create the scale we'll be using to map values to colors.
  let scale =
    colorScheme === 'custom'
      ? makeCustomColorScale(colorSpace, bucketData.min, bucketData.max, thresholds)
      : makeSpectrumColorScale(colorScheme, bucketData.min, bucketData.max);

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

  // The panel consists of two main parts, the main chart area, and the legend.
  // We use SVG groups, `g`, to translate the elements into place.
  return (
    <svg width={width} height={height}>
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
            thresholds={thresholds}
            colorScale={scale}
          />
        </g>
      ) : null}
    </svg>
  );
};
