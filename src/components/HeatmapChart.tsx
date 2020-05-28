import React from 'react';
import * as d3 from 'd3';

import { dateTime, dateTimeParse } from '@grafana/data';

import { BucketData } from '../bucket';
import { HeatmapAxes } from './HeatmapAxes';
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

  // Hide axes for small panels.
  const showAxes = width > 250;

  const chartWidth = width - (showAxes ? offset.left : 0.0);
  const chartHeight = height - (showAxes ? offset.top + offset.bottom : 0.0);

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

  const heatMap = (
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
  );

  return (
    <>
      {showAxes ? (
        <g transform={`translate(${offset.left}, ${offset.top})`}>
          <HeatmapAxes
            values={values}
            from={firstDay}
            to={lastDay}
            numDays={numDays}
            width={chartWidth}
            height={chartHeight}
            timeZone={timeZone}
            dailyInterval={dailyInterval}
          />
          {heatMap}
        </g>
      ) : (
        heatMap
      )}
    </>
  );
};
