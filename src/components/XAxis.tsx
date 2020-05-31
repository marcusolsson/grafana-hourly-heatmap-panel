import React from 'react';
import * as d3 from 'd3';
import { DateTime, dateTime, dateTimeFormat } from '@grafana/data';

interface XAxisProps {
  values: any[];
  from: DateTime;
  to: DateTime;
  width: number;
  numDays: number;
  timeZone: string;
}

export const XAxis: React.FC<XAxisProps> = ({ width, values, from, to, numDays, timeZone }) => {
  const x = d3
    .scaleBand()
    .domain(values)
    .rangeRound([0, width]);

  const xTime = d3
    .scaleTime()
    .domain([from.toDate(), to.toDate()])
    .range([0, width]);

  const every = calculateTickWidth(width, numDays);

  const xTimeAxis = d3
    .axisBottom(xTime)
    .ticks(d3.timeDay, every)
    .tickFormat(d => dateTimeFormat(dateTime(d as number), { timeZone, format: 'MM/DD' }));

  const xCategoryAxis = d3.axisBottom(x);

  const xAxis: any = every > 1 ? xTimeAxis : xCategoryAxis;

  return (
    <g
      ref={node => {
        const container = d3.select(node).call(xAxis);

        // Remove junk.
        container.select('.domain').remove();
        container.selectAll('line').remove();
      }}
    />
  );
};

const calculateTickWidth = (width: number, numDays: number) => {
  const preferredTickWidth = 60;
  const ratio = (preferredTickWidth / width) * numDays;
  return Math.max(Math.floor(ratio), 1);
};
