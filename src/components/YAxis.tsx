import React from 'react';
import * as d3 from 'd3';
import { dateTime, DateTimeDuration, toDuration } from '@grafana/data';

interface YAxisProps {
  height: number;
  dailyInterval: [number, number];
}

export const YAxis: React.FC<YAxisProps> = ({ height, dailyInterval }) => {
  const yAxis: any = createResponsiveYAxis(height, dailyInterval);

  return (
    <g
      ref={node => {
        const container = d3.select(node).call(yAxis);

        // Remove junk.
        container.select('.domain').remove();
        container.selectAll('line').remove();
      }}
    />
  );
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
