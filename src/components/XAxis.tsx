import React from 'react';
import * as d3 from 'd3';
import { DateTime, dateTime, dateTimeFormat } from '@grafana/data';

interface XAxisProps {
  values: any[];
  from: DateTime;
  to: DateTime;
  width: number;
  height: number;
  numDays: number;
  timeZone: string;
}

export const XAxis: React.FC<XAxisProps> = ({ width, height, values, from, to, numDays, timeZone }) => {
  const xAxis: any = createResponsiveXAxis(values, from, to, width, numDays, timeZone);

  return (
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
  );
};

// createResponsiveXAxis returns a horizontal axis that uses the provided
// band scale for smaller interval, and falls back to a time scale for larger
// intervals.
const createResponsiveXAxis = (
  values: string[],
  from: DateTime,
  to: DateTime,
  width: number,
  numDays: number,
  timeZone: string
) => {
  const x = d3
    .scaleBand()
    .domain(values)
    .rangeRound([0, width]);

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

  const xCategoryAxis = d3.axisBottom(x);

  return every > 1 ? xTimeAxis : xCategoryAxis;
};
