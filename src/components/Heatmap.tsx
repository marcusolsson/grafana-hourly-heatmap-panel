import React from 'react';
import * as d3 from 'd3';
import { DisplayValue, DateTime, dateTimeParse } from '@grafana/data';

import { BucketData } from '../bucket';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const minutesPerDay = 24 * 60;

interface HeatmapProps {
  values: string[];
  data: BucketData;
  colorScale: any;
  width: number;
  height: number;
  numBuckets: number;
  timeZone: string;
  dailyIntervalMinutes: [number, number];
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
  dailyIntervalMinutes,
}) => {
  const x = d3
    .scaleBand()
    .domain(values)
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain(dailyIntervalMinutes)
    .range([0, height]);

  const cellWidth = Math.ceil(x.bandwidth());
  const cellHeight = bucketHeight(height, numBuckets, dailyIntervalMinutes);

  return (
    <g>
      {data.points.map((d, i) => {
        const startOfDay = dateTimeParse(d.dayMillis, { timeZone }).startOf('day');
        const bucketStart = dateTimeParse(d.bucketStartMillis, { timeZone });
        const minutesSinceStartOfDay = bucketStart.hour!() * 60 + bucketStart.minute!();

        return (
          <Tippy
            key={i}
            content={tooltip(bucketStart, data.valueDisplay(d.value), numBuckets, timeZone)}
            placement="bottom"
            animation={false}
          >
            <rect
              x={x(startOfDay.valueOf().toString())}
              y={Math.ceil(y(minutesSinceStartOfDay))}
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

// Generates a tooltip for a data point.
const tooltip = (bucketStartTime: DateTime, displayValue: DisplayValue, numBuckets: number, tz: string) => {
  const localeOptionsDate = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: tz === 'browser' ? undefined : tz,
  };
  const localeOptionsTime = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz === 'browser' ? undefined : tz,
    timeZoneName: 'short',
  };

  const bucketDate = bucketStartTime.toDate().toLocaleDateString(undefined, localeOptionsDate);
  const bucketStart = bucketStartTime.toDate().toLocaleTimeString(undefined, localeOptionsTime);
  const bucketEnd = bucketStartTime
    .add(minutesPerDay / numBuckets, 'minute')
    .toDate()
    .toLocaleTimeString(undefined, localeOptionsTime);

  return (
    <div>
      <div>{bucketDate}</div>
      <div>
        {bucketStart}&#8211;{bucketEnd}:{' '}
        <strong>
          {displayValue.text}
          {displayValue.suffix ? displayValue.suffix : null}
        </strong>
      </div>
    </div>
  );
};

const bucketHeight = (height: number, numBuckets: number, dailyIntervalMinutes: [number, number]) => {
  const minutesPerBucket = minutesPerDay / numBuckets;
  const intervalMinutes = dailyIntervalMinutes[1] - dailyIntervalMinutes[0];
  const pixelsPerBucket = height / (intervalMinutes / minutesPerBucket);
  return Math.ceil(pixelsPerBucket);
};
