import React from 'react';
import * as d3 from 'd3';

import { BucketData } from '../bucket';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const moment = require('moment');

const timeFormat = 'MM/DD';

interface Props {
  data: BucketData;
  width: number;
  height: number;
  colorScale: d3.ScaleSequential<string>;
}

/**
 * A heatmap chart where each column represents a day, and each row represents a
 * bucket.
 */
export const Heatmap: React.FC<Props> = ({ data, width, height, colorScale }) => {
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
      moment(dayMillis)
        .startOf('day')
        .valueOf()
    )
  );

  // Create the values for the X axis.
  const firstDay = moment(begin);
  const lastDay = moment(end);

  const numDays = lastDay.add(1, 'day').diff(firstDay, 'days');

  // Generate time values for the X axis. These are used to center the dates on
  // the X axis under each day. Only used when the panel dimensions allow a
  // tick per day.
  let values: string[] = [];
  for (let i = 0; i < numDays; i++) {
    values.push(
      firstDay
        .clone()
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
}

/**
 * A two-dimensional grid of colored cells.
 */
const HeatmapGraph: React.FC<HeatmapProps> = ({ values, data, colorScale, width, height, numBuckets }) => {
  const x = d3
    .scaleBand()
    .domain(values)
    .rangeRound([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, 1440])
    .rangeRound([0, height]);

  const cellWidth = Math.ceil(x.bandwidth());
  const cellHeight = Math.ceil(height / numBuckets);

  // Generates a tooltip for a data point.
  const tooltip = (day: moment.Moment, displayValue: any) => {
    return (
      <div>
        <div>
          {day.format('LL')} {day.format('LT')}&#8211;
          {day.add((24 * 60) / numBuckets, 'minute').format('LT')}
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

        return (
          <Tippy content={tooltip(moment(d.dayMillis), displayValue)} placement="bottom">
            <rect
              x={x(moment(d.dayMillis).format(timeFormat))}
              y={Math.ceil(y(d.bucket))}
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
  from: moment.Moment;
  to: moment.Moment;
  width: number;
  height: number;
  numDays: number;
}

export const TimeAxis: React.FC<TimeAxisProps> = ({ values, from, to, width, height, numDays }) => {
  const x = d3
    .scaleBand()
    .domain(values)
    .rangeRound([0, width]);

  const xAxis: any = createResponsiveTimeAxis(x, from, to, width, numDays);

  const y = d3
    .scaleLinear()
    .domain([0, 24])
    .rangeRound([0, height]);

  const preferredTickHeight = 20;
  const ratio = (preferredTickHeight / height) * 24;
  let every = Math.max(Math.round(ratio), 1);

  const yAxis: any = d3
    .axisLeft(y)
    .tickValues(d3.range(0, 24, every))
    .tickFormat(d => formatDuration(moment.duration(d, 'hours'), 'HH:mm'));

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
  from: moment.Moment,
  to: moment.Moment,
  width: number,
  numDays: number
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
    .tickFormat(d => moment(d).format('MM/DD'));

  const xCategoryAxis = d3.axisBottom(bandScale);

  return every > 1 ? xTimeAxis : xCategoryAxis;
};

const formatDuration = (duration: moment.Duration, format: string) => {
  const date = moment().startOf('day');
  return date.add(duration).format(format);
};
