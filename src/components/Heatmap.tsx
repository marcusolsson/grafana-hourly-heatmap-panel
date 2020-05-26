import React from 'react';
import * as d3 from 'd3';

import { DateTimeDuration, toDuration, DateTime, dateTime, dateTimeParse, dateTimeFormat } from '@grafana/data';

import { BucketData } from '../bucket';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const timeFormat = 'MM/DD';

interface Props {
  data: BucketData;
  width: number;
  height: number;
  colorScale: d3.ScaleSequential<string>;
  timeZone: string;
  dailyInterval: [number, number];
}

/**
 * A heatmap chart where each column represents a day, and each row represents a
 * bucket.
 */
export const Heatmap: React.FC<Props> = ({ data, width, height, colorScale, timeZone, dailyInterval }) => {
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
    <HeatmapGraph
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
          <TimeAxis
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

interface HeatmapProps {
  values: string[];
  data: BucketData;
  colorScale: d3.ScaleSequential<string>;
  width: number;
  height: number;
  numBuckets: number;
  timeZone: string;
  dailyInterval: [number, number];
}

const hoursToMinutesInterval = (intervalHours: [number, number]): [number, number] => {
  const from = intervalHours[0];
  const to = intervalHours[1] === 0 ? 24 : intervalHours[1];

  return [from * 60, to * 60];
};

/**
 * A two-dimensional grid of colored cells.
 */
const HeatmapGraph: React.FC<HeatmapProps> = ({
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

interface TimeAxisProps {
  values: any[];
  from: DateTime;
  to: DateTime;
  width: number;
  height: number;
  numDays: number;
  timeZone: string;
  dailyInterval: [number, number];
}

export const TimeAxis: React.FC<TimeAxisProps> = ({
  values,
  from,
  to,
  width,
  height,
  numDays,
  timeZone,
  dailyInterval,
}) => {
  const x = d3
    .scaleBand()
    .domain(values)
    .rangeRound([0, width]);

  const xAxis: any = createResponsiveTimeAxis(x, from, to, width, numDays, timeZone);

  const y = d3
    .scaleLinear()
    .domain(dailyInterval)
    .rangeRound([0, height]);

  const preferredTickHeight = 20;
  const ratio = (preferredTickHeight / height) * 24;
  let every = Math.max(Math.round(ratio), 1);

  const yAxis: any = d3
    .axisLeft(y)
    .tickValues(d3.range(dailyInterval[0], dailyInterval[1], every))
    .tickFormat(d => formatDuration(toDuration(d as number, 'hours'), 'HH:mm'));

  return (
    <>
      <g
        ref={node => {
          const container = d3
            .select(node)
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

          // Remove junk.
          container.select('.domain').remove();
          container.selectAll('line').remove();
        }}
      />
      <g
        ref={node => {
          const container = d3.select(node).call(yAxis);

          // Remove junk.
          container.select('.domain').remove();
          container.selectAll('line').remove();
        }}
      />
    </>
  );
};

// createResponsiveTimeAxis returns a horizontal axis that uses the provided
// band scale for smaller interval, and falls back to a time scale for larger
// intervals.
const createResponsiveTimeAxis = (
  bandScale: any,
  from: DateTime,
  to: DateTime,
  width: number,
  numDays: number,
  timeZone: string
) => {
  const xTime = d3
    .scaleTime()
    .domain([from.toDate(), to.toDate()])
    .range([0, width]);

  const preferredTickWidth = 60;

  const ratio = (preferredTickWidth / width) * numDays;
  let every = Math.max(Math.floor(ratio), 1);

  const xTimeAxis = d3
    .axisBottom(xTime)
    .ticks(d3.timeDay, every)
    .tickFormat(d => dateTimeFormat(dateTime(d as number), { timeZone, format: 'MM/DD' }));

  const xCategoryAxis = d3.axisBottom(bandScale);

  return every > 1 ? xTimeAxis : xCategoryAxis;
};

const formatDuration = (duration: DateTimeDuration, format: string) => {
  const date = dateTime().startOf('day');
  return date.add(duration.hours(), 'hours').format(format);
};
