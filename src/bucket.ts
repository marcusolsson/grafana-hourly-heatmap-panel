import * as d3 from 'd3';
import { DataFrame, DisplayProcessor } from '@grafana/data';

const moment = require('moment');

interface Point {
  time: number;
  value: number;
}

interface PointAgg {
  time: number;
  values: Point[];
}

export interface BucketPoint {
  dayMillis: number;
  bucket: number;
  value: number;
}

export interface BucketData {
  numBuckets: number;
  min: number;
  max: number;
  points: BucketPoint[];
  displayProcessor: DisplayProcessor;
}

const reduce = (agg: PointAgg[], reducer: (n: Array<number | undefined>) => number): Point[] => {
  return agg.map(({ time, values }) => ({
    time: time,
    value: reducer(values.map(({ value }) => value)),
  }));
};

export const group = (points: Point[], by: number): PointAgg[] => {
  const tmp = points.map(point => {
    const time = moment(point.time).utc();
    const mins = time.minutes();
    time
      .minutes(mins - (mins % by))
      .seconds(0)
      .milliseconds(0);

    return {
      [time.valueOf()]: point,
    };
  });

  const tmp2: PointAgg[] = Object.entries(
    tmp.reduce((acc: any, val: any) => {
      const day: number = parseFloat(Object.keys(val)[0]);
      (acc[day] = acc[day] || []).push(val[day]);
      return acc;
    }, {})
  ).map(([key, values]) => ({
    time: parseFloat(key),
    values: values as Point[],
  }));

  return tmp2;
};

export const bucketize = (frame: DataFrame): BucketData => {
  const timeField = frame.fields.find(f => f.type === 'time');
  const valueField = frame.fields.find(f => f.type === 'number');

  const rows = Array.from({ length: frame.length }, (v: any, i: number) => ({
    time: timeField?.values.get(i),
    value: valueField?.values.get(i),
  }));

  const customData = valueField?.config.custom.data;

  const res = group(rows, customData.groupBy);
  const res2 = reduce(res, funs[customData.aggregator.toString()]);
  const res3 = group(res2, 1440);
  const res4 = res3.flatMap(({ time, values }) =>
    values.map(({ time, value }) => ({
      dayMillis: time,
      bucket: moment(time).minute() + moment(time).hour() * 60,
      value,
    }))
  );

  const defaultDisplay: DisplayProcessor = (value: any) => ({ numeric: value, text: value.toString() });

  const display = valueField?.display ? valueField?.display : defaultDisplay;

  const [autoMin, autoMax] = d3.extent(res4.map(({ value }) => value));

  return {
    numBuckets: (24 * 60) / customData.groupBy,
    displayProcessor: display,
    points: res4,
    min: (valueField?.config.min !== undefined ? valueField?.config.min : autoMin) as number,
    max: (valueField?.config.max !== undefined ? valueField?.config.max : autoMax) as number,
  };
};

const funs: any = {
  avg: (vals: number[]) => d3.mean(vals),
  sum: (vals: number[]) => d3.sum(vals),
  count: (vals: number[]) => vals.length,
  min: (vals: number[]) => d3.min(vals),
  max: (vals: number[]) => d3.max(vals),
  first: (vals: number[]) => vals[0],
  last: (vals: number[]) => vals[vals.length - 1],
};
