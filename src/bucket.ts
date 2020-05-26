import * as d3 from 'd3';
import { dateTime, DataFrame, DisplayProcessor } from '@grafana/data';

export interface Point {
  time: number;
  value: number;
}

interface PointAgg {
  time: number;
  values: Point[];
}

export interface BucketPoint {
  dayMillis: number;
  bucketStartMillis: number;
  value: number;
}

export interface BucketData {
  numBuckets: number;
  min: number;
  max: number;
  points: BucketPoint[];
  displayProcessor: DisplayProcessor;
}

// reduce applies a reducer to an aggregated point set.
const reduce = (agg: PointAgg[], reducer: (n: Array<number | undefined>) => number): Point[] => {
  return agg.map(({ time, values }) => ({
    time: time,
    value: reducer(values.map(({ value }) => value)),
  }));
};

// groupByMinutes groups a set of points
export const groupByMinutes = (points: Point[], minutes: number, timeZone: string): PointAgg[] => {
  // Create keys for interval start.
  const rounded = points.map(point => {
    const intervalStart = dateTime(point.time);
    intervalStart.subtract(intervalStart.minute ? intervalStart.minute() % minutes : 0.0, 'minutes');

    return {
      [intervalStart.valueOf()]: point,
    };
  });

  // Group by interval start.
  return Object.entries(
    rounded.reduce((acc: any, val: any) => {
      const intervalStartMillis: number = parseFloat(Object.keys(val)[0]);
      (acc[intervalStartMillis] = acc[intervalStartMillis] || []).push(val[intervalStartMillis]);
      return acc;
    }, {})
  ).map(([key, values]) => ({
    time: parseFloat(key),
    values: values as Point[],
  }));
};

// groupByDay works like to groupByDays but is a bit simpler.
export const groupByDay = (points: Point[], timeZone: string): PointAgg[] => {
  const rounded = points.map(point => ({
    [dateTime(point.time)
      .startOf('day')
      .valueOf()]: point,
  }));

  return Object.entries(
    rounded.reduce((acc: any, val: any) => {
      const dayMillis: number = parseFloat(Object.keys(val)[0]);
      (acc[dayMillis] = acc[dayMillis] || []).push(val[dayMillis]);
      return acc;
    }, {})
  ).map(([key, values]) => ({
    time: parseFloat(key),
    values: values as Point[],
  }));
};

const defaultDisplay: DisplayProcessor = (value: any) => ({ numeric: value, text: value.toString() });
const minutesPerDay = 24 * 60;

// bucketize returns the main data structure used by the visualizations.
export const bucketize = (frame: DataFrame, timeZone: string): BucketData => {
  // Use the first temporal field.
  const timeField = frame.fields.find(f => f.type === 'time');

  // Use the first numeric field.
  const valueField = frame.fields.find(f => f.type === 'number');

  // Convert data frame fields to rows.
  const rows = Array.from({ length: frame.length }, (v: any, i: number) => ({
    time: timeField?.values.get(i),
    value: valueField?.values.get(i),
  }));

  // Extract the field configuration..
  const customData = valueField?.config.custom.data;

  // Group and reduce values.
  const groupedByMinutes = groupByMinutes(rows, customData.groupBy, timeZone);
  const reducedMinutes = reduce(groupedByMinutes, aggregators[customData.aggregator]);
  const points = groupByDay(reducedMinutes, timeZone).flatMap(({ time, values }) =>
    values.map(({ time, value }) => ({
      dayMillis: time,
      bucketStartMillis: time,
      value,
    }))
  );

  // Calculate the min and max values.
  const [autoMin, autoMax] = d3.extent(points.map(({ value }) => value));

  // Use the min and max defined in the field config, or default to auto values.
  const min = valueField?.config.min !== undefined ? valueField?.config.min : autoMin;
  const max = valueField?.config.max !== undefined ? valueField?.config.max : autoMax;

  return {
    numBuckets: Math.floor(minutesPerDay / customData.groupBy),
    displayProcessor: valueField?.display ? valueField?.display : defaultDisplay,
    points: points,
    min: min as number,
    max: max as number,
  };
};

// Lookup table for aggregator functions.
const aggregators: any = {
  avg: (vals: number[]) => d3.mean(vals),
  sum: (vals: number[]) => d3.sum(vals),
  count: (vals: number[]) => vals.length,
  min: (vals: number[]) => d3.min(vals),
  max: (vals: number[]) => d3.max(vals),
  first: (vals: number[]) => vals[0],
  last: (vals: number[]) => vals[vals.length - 1],
};
