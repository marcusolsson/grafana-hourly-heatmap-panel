import React from 'react';
import { PanelProps } from '@grafana/data';
import { useTheme } from '@grafana/ui';
import { Chart } from './components/Chart';
import { measureText } from 'grafana-plugin-support';
import { HeatmapOptions } from './types';

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

  const theme = useTheme();

  return (
    <svg width={width} height={height}>
      {/* For multiple queries, divide the panel into segments of equal height. */}
      {data.series.map((frame, i) => {
        const segmentHeight = height / data.series.length;

        // Helper for creating a vertically and horizontally centered message.
        const displayMessage = (message: string): React.ReactNode => {
          return (
            <text
              style={{ fill: theme.colors.text }}
              x={width / 2 - (measureText(message, '14px')?.width ?? 0) / 2}
              y={i * segmentHeight + segmentHeight / 2}
            >
              {message}
            </text>
          );
        };

        // Attempt to get a time field by name or default to the first time
        // field we find.
        const timeField = timeFieldName
          ? frame.fields.find((f) => f.name === timeFieldName)
          : frame.fields.find((f) => f.type === 'time');
        if (!timeField || timeField.type !== 'time') {
          return displayMessage('Select a time dimension');
        }

        // Attempt to get a value field by name or default to the first number
        // field we find.
        const valueField = valueFieldName
          ? frame.fields.find((f) => f.name === valueFieldName)
          : frame.fields.find((f) => f.type === 'number');
        if (!valueField || valueField.type !== 'number') {
          return displayMessage('Select a value dimension');
        }

        return (
          <g key={i} transform={`translate(0, ${i * segmentHeight})`}>
            <Chart
              width={width}
              height={segmentHeight}
              legend={showLegend}
              timeField={timeField}
              valueField={valueField}
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
