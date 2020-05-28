import React from 'react';
import * as d3 from 'd3';
import { DateTime, dateTimeParse } from '@grafana/data';

import { BucketData } from '../bucket';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const timeFormat = 'MM/DD';

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
  const x = d3
    .scaleBand()
    .domain(values)
    .rangeRound([0, width]);

  const dailyIntervalMinutes = hoursToMinutesInterval(dailyInterval);

  const y = d3
    .scaleLinear()
    .domain(dailyIntervalMinutes)
    .rangeRound([0, height]);

  const minutesPerDay = 24 * 60;

  const minutesPerBucket = minutesPerDay / numBuckets;
  const intervalMinutes = dailyIntervalMinutes[1] - dailyIntervalMinutes[0];
  const pixelsPerBucket = height / (intervalMinutes / minutesPerBucket);

  const cellWidth = Math.ceil(x.bandwidth());
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
      {data.points.map(d => {
        const displayValue = data.displayProcessor(d.value);

        const day = dateTimeParse(d.dayMillis, { timeZone: timeZone }).format(timeFormat);

        const bucketTime = dateTimeParse(d.bucketStartMillis, { timeZone: timeZone });

        const bucket =
          (bucketTime.hour ? bucketTime.hour() : 0.0) * 60 + (bucketTime.minute ? bucketTime.minute() : 0.0);

        return (
          <Tippy content={tooltip(dateTimeParse(d.dayMillis, { timeZone }), displayValue)} placement="bottom">
            <rect
              x={x(day)}
              y={Math.ceil(y(bucket))}
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

const hoursToMinutesInterval = (intervalHours: [number, number]): [number, number] => {
  const from = intervalHours[0];
  const to = intervalHours[1] === 0 ? 24 : intervalHours[1];

  return [from * 60, to * 60];
};
