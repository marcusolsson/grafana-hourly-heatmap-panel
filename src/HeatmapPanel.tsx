import React from 'react';
import { FieldType, PanelProps } from '@grafana/data';
import { Chart } from './components/Chart';
import { HeatmapOptions } from './types';
import { PanelWizard } from 'grafana-plugin-support';

const usage = {
  schema: [{ type: FieldType.time }, { type: FieldType.number }],
  url: 'https://github.com/marcusolsson/grafana-hourly-heatmap-panel',
};

interface Props extends PanelProps<HeatmapOptions> {}

/**
 * HeatmapPanel visualizes a heatmap with a histogram for each day along with
 * axes and a legend.
 *
 * A panel is a regular React component that accepts a `Props` that extends
 * `PanelProps`. The `PanelProps` object gives your component access to things
 * like query results, panel options, and the current timezone.
 */
export const HeatmapPanel: React.FC<Props> = ({ options, data, width, height, timeZone, timeRange }) => {
  // `options` contains the properties defined in the `HeatmapOptions` object.
  const {
    valueFieldName,
    timeFieldName,
    regions,
    showLegend,
    showValueIndicator,
    showCellBorder,
    showTooltip,
    legendGradientQuality,
    from,
    to,
  } = options;

  // Parse the extents of hours to display in a day.
  const dailyIntervalHours: [number, number] = [parseFloat(from), to === '0' ? 24 : parseFloat(to)];

  if (data.series.length === 0) {
    return <PanelWizard {...usage} />;
  }

  const frames = data.series.map((frame) => {
    // Attempt to get a time field by name or default to the first time
    // field we find.
    const timeField = timeFieldName
      ? frame.fields.find((f) => f.name === timeFieldName)
      : frame.fields.find((f) => f.type === 'time');

    // Attempt to get a value field by name or default to the first number
    // field we find.
    const valueField = valueFieldName
      ? frame.fields.find((f) => f.name === valueFieldName)
      : frame.fields.find((f) => f.type === 'number');

    return { timeField, valueField, fields: frame.fields };
  });

  // Make sure all data frames are valid time series.
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    if (!frame.timeField || !frame.valueField) {
      return <PanelWizard {...usage} fields={frame.fields} />;
    }
  }

  return (
    <svg width={width} height={height}>
      {/* For multiple queries, divide the panel into segments of equal height. */}
      {frames.map((frame, i) => {
        const segmentHeight = height / data.series.length;

        return (
          <g key={i} transform={`translate(0, ${i * segmentHeight})`}>
            <Chart
              width={width}
              height={segmentHeight}
              legend={showLegend}
              timeField={frame.timeField!}
              valueField={frame.valueField!}
              timeZone={timeZone}
              timeRange={timeRange}
              dailyIntervalHours={dailyIntervalHours}
              regions={regions ?? []}
              showValueIndicator={showValueIndicator}
              cellBorder={showCellBorder}
              legendGradientQuality={legendGradientQuality}
              tooltip={showTooltip}
            />
          </g>
        );
      })}
    </svg>
  );
};
