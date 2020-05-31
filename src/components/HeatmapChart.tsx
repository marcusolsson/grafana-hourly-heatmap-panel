import React from 'react';
import * as d3 from 'd3';

import { dateTime, dateTimeParse } from '@grafana/data';

import { BucketData } from '../bucket';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { Heatmap } from './Heatmap';

const timeFormat = 'MM/DD';

interface HeatmapChartProps {
  data: BucketData;
  width: number;
  height: number;
  colorScale: any;
  timeZone: string;
  dailyInterval: [number, number];
}

/**
 * A heatmap chart where each column represents a day, and each row represents a
 * bucket.
 */
export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  width,
  height,
  colorScale,
  timeZone,
  dailyInterval,
}) => {
  // Take the axes into account. Ideally we'd use the axis bounding boxes to
  // calculate the offsets dynamically.
  const offset = {
    top: 5,
    left: 35,
    bottom: 20,
  };

  const chartWidth = width - offset.left;
  const chartHeight = height - (offset.top + offset.bottom);

  // Find the first and last day in the dataset.
  const [begin, end] = d3.extent(
    data.points.map(({ dayMillis }) =>
      dateTimeParse(dayMillis, { timeZone })
        .startOf('day')
        .valueOf()
    )
  );

  // Create the values for the X axis.
  const firstDay = dateTimeParse(begin || Date.now(), { timeZone });
  const lastDay = dateTimeParse(end || Date.now(), { timeZone });

  const numDays = lastDay.add(1, 'day').diff(firstDay, 'days');

  // Generate time values for the X axis. These are used to center the dates on
  // the X axis under each day. Only used when the panel dimensions allow a
  // tick per day.
  let values: string[] = [];
  for (let i = 0; i < numDays; i++) {
    values.push(
      dateTime(firstDay)
        .add(i, 'day')
        .format(timeFormat)
    );
  }

  return (
    <g transform={`translate(${offset.left}, ${offset.top})`}>
      <g transform={`translate(0, ${chartHeight})`}>
        <XAxis values={values} from={firstDay} to={lastDay} width={chartWidth} numDays={numDays} timeZone={timeZone} />
      </g>
      <YAxis height={chartHeight} dailyInterval={dailyInterval} />
      <Heatmap
        data={data}
        numBuckets={data.numBuckets}
        values={values}
        width={chartWidth}
        height={chartHeight}
        colorScale={colorScale}
        timeZone={timeZone}
        dailyInterval={dailyInterval}
      />
    </g>
  );
};
