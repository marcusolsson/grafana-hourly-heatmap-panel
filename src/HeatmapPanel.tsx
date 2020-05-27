import React from 'react';
import { PanelProps } from '@grafana/data';
import { HeatmapOptions } from 'types';

import { makeColorScale } from './colors';
import { bucketize } from './bucket';

import { SpectrumLegend } from './components/SpectrumLegend';
import { Heatmap } from './components/Heatmap';

interface Props extends PanelProps<HeatmapOptions> {}

/**
 * HeatmapPanel visualizes a heatmap with a histogram for each day along with axes and a legend.
 */
export const HeatmapPanel: React.FC<Props> = ({ options, data, width, height, timeZone }) => {
  const { spectrum, showLegend, from, to } = options;

  const dailyIntervalHours: [number, number] = [parseFloat(from), to === '0' ? 24 : parseFloat(to)];

  // Only get the first series if the query returned more than one.
  const frame = data.series[0];

  // Create a histogram for each day.
  const bucketData = bucketize(frame, timeZone, dailyIntervalHours);

  // Create the scale we'll be using to map values to colors.
  const colorScale = makeColorScale(spectrum.scheme, bucketData.min, bucketData.max);

  // Calculate legend dimensions.
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
    <svg width={width} height={height}>
      <g transform={`translate(${heatmapPadding.left}, ${heatmapPadding.top})`}>
        <Heatmap
          data={bucketData}
          width={heatmapWidth}
          height={heatmapHeight}
          colorScale={colorScale}
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
          <SpectrumLegend
            scheme={spectrum.scheme}
            width={legendWidth}
            height={legendHeight}
            min={bucketData.min}
            max={bucketData.max}
            display={bucketData.displayProcessor}
          />
        </g>
      ) : null}
    </svg>
  );
};
