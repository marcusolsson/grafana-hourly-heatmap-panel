import React from 'react';
import * as d3 from 'd3';
import { DateTimeDuration, toDuration, DateTime, dateTime, dateTimeFormat } from '@grafana/data';

interface HeatmapAxesProps {
  values: any[];
  from: DateTime;
  to: DateTime;
  width: number;
  height: number;
  numDays: number;
  timeZone: string;
  dailyInterval: [number, number];
}

/**
 * HeatmapAxes draws a X and Y axis for the heatmap chart.
 */
export const HeatmapAxes: React.FC<HeatmapAxesProps> = ({
  values,
  from,
  to,
  width,
  height,
  numDays,
  timeZone,
  dailyInterval,
}) => {
  // Create each individual axis.
  const xAxis: any = createResponsiveXAxis(values, from, to, width, numDays, timeZone);
  const yAxis: any = createResponsiveYAxis(height, dailyInterval);

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

const createResponsiveYAxis = (height: number, dailyInterval: [number, number]) => {
  const preferredTickHeight = 20;
  const ratio = (preferredTickHeight / height) * 24;
  let every = Math.max(Math.round(ratio), 1);

  const y = d3
    .scaleLinear()
    .domain(dailyInterval)
    .rangeRound([0, height]);

  return d3
    .axisLeft(y)
    .tickValues(d3.range(dailyInterval[0], dailyInterval[1], every))
    .tickFormat(d => formatDuration(toDuration(d as number, 'hours'), 'HH:mm'));
};

const formatDuration = (duration: DateTimeDuration, format: string) => {
  const date = dateTime().startOf('day');
  return date.add(duration.hours(), 'hours').format(format);
};
