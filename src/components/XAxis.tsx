import React from 'react';
import * as d3 from 'd3';
import { DateTime, dateTimeParse } from '@grafana/data';

interface XAxisProps {
  values: any[];
  from: DateTime;
  to: DateTime;
  width: number;
  numDays: number;
  timeZone: string;
}

const localeOptions = {
  month: '2-digit',
  day: '2-digit',
};

const referenceText = dateTimeParse(0).toDate().toLocaleDateString(undefined, localeOptions);

export const XAxis: React.FC<XAxisProps> = React.memo(({ width, values, from, to, numDays, timeZone }) => {
  const x = d3.scaleBand().domain(values).rangeRound([0, width]);

  const xTime = d3.scaleTime().domain([from.toDate(), to.toDate()]).range([0, width]);

  const every = calculateTickInterval(width, numDays, referenceText);

  const xTimeAxis = d3
    .axisBottom(xTime)
    .ticks(d3.timeDay, every)
    .tickFormat((d) =>
      dateTimeParse(d as number, { timeZone })
        .toDate()
        .toLocaleDateString(undefined, localeOptions)
    );

  const xCategoryAxis = d3
    .axisBottom(x)
    .tickFormat((d) =>
      dateTimeParse(parseInt(d, 10), { timeZone }).toDate().toLocaleDateString(undefined, localeOptions)
    );

  const xAxis: any = every > 1 ? xTimeAxis : xCategoryAxis;

  return (
    <g
      ref={(node) => {
        const container = d3.select(node).call(xAxis);

        // Remove junk.
        container.select('.domain').remove();
        container.selectAll('line').remove();
      }}
    />
  );
});

const calculateTickInterval = (width: number, numDays: number, referenceText: string) => {
  const preferredTickWidth = measureText(referenceText);
  return Math.max(Math.ceil(numDays / (width / preferredTickWidth)), 1);
};

const measureText = (text: string): number => {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = '14px Arial';
    return ctx.measureText(text).width;
  }
  return 0;
};
XAxis.displayName = 'XAxis';
