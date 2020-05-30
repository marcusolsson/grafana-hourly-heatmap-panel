import React from 'react';
import * as d3 from 'd3';
import { DateTime, dateTimeParse } from '@grafana/data';

import { BucketData } from '../bucket';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const timeFormat = 'MM/DD';
const minutesPerDay = 24 * 60;

interface HeatmapProps {
  values: string[];
  data: BucketData;
  colorScale: any;
  width: number;
  height: number;
  numBuckets: number;
  timeZone: string;
  dailyInterval: [number, number];
}

/**
 * A two-dimensional grid of colored cells.
 */
export const Heatmap: React.FC<HeatmapProps> = ({
  values,
  data,
  colorScale,
  width,
  height,
  numBuckets,
  timeZone,
  dailyInterval,
}) => {
  // Maps columns (days) to a position along the X axis.
  const x = d3
    .scaleBand()
    .domain(values)
    .range([0, width]);

  const cellWidth = Math.ceil(x.bandwidth());

  // The interval of hours to display is given in hours, but since we want to
  // map buckets on a minute basis, we first need to convert the interval to
  // minutes.
  const dailyIntervalMinutes = [dailyInterval[0] * 60, dailyInterval[1] * 60];

  const y = d3
    .scaleLinear()
    .domain(dailyIntervalMinutes)
    .range([0, height]);

  // Calculate the height of each cell.
  const minutesPerBucket = minutesPerDay / numBuckets;
  const intervalMinutes = dailyIntervalMinutes[1] - dailyIntervalMinutes[0];
  const pixelsPerBucket = height / (intervalMinutes / minutesPerBucket);
  const cellHeight = Math.ceil(pixelsPerBucket);

  // Generates a tooltip for a data point.
  const tooltip = (day: DateTime, displayValue: any) => {
    return (
      <div>
        <div>
          {day.format('LL')} {day.format('LT')}&#8211;
          {day.add(minutesPerDay / numBuckets, 'minute').format('LT')}
        </div>
        <div>
          <strong>
            {displayValue.text}
            {displayValue.suffix ? displayValue.suffix : null}
          </strong>
        </div>
      </div>
    );
  };

  return (
    <g>
      {data.points.map((d, i) => {
        // The display processor formats the value based on field
        // configuration, such as the unit and number of decimals.
        const displayValue = data.displayProcessor(d.value);

        const startOfDay = dateTimeParse(d.dayMillis, { timeZone });
        const startOfBucketTime = dateTimeParse(d.bucketStartMillis, { timeZone });

        // The Y value of the cell is the number of elapsed minutes since the
        // start of the day.
        const startOfBucketMinute =
          (startOfBucketTime.hour ? startOfBucketTime.hour() : 0.0) * 60 +
          (startOfBucketTime.minute ? startOfBucketTime.minute() : 0.0);

        return (
          <Tippy
            key={i}
            content={tooltip(dateTimeParse(d.dayMillis, { timeZone }), displayValue)}
            placement="bottom"
            animation={false}
          >
            <rect
              x={x(startOfDay.format(timeFormat))}
              y={Math.ceil(y(startOfBucketMinute))}
              fill={colorScale(d.value)}
              width={cellWidth}
              height={cellHeight}
            />
          </Tippy>
        );
      })}
    </g>
  );
};
