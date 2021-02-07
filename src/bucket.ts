import * as d3 from 'd3';
import { TimeRange, dateTime, dateTimeParse, DisplayProcessor, Field, getDisplayProcessor } from '@grafana/data';

export interface Point {
  time: number;
  value: number;
}

interface PointSet {
  time: number;
  values: Point[];
}

export interface BucketPoint {
  // dayMillis corresponds to the start of the day.
  dayMillis: number;

  // bucketStartMillis corresponds to the start of a bucket, for example the start of every hour.
  bucketStartMillis: number;

  value: number;
}

export interface BucketData {
  numBuckets: number;
  points: BucketPoint[];
  valueField: Field<number>;
  timeField: Field<number>;
}

// reduce applies a calculation to an aggregated point set.
const reduce = (agg: PointSet[], calculation: (n: Array<number | undefined>) => number): Point[] => {
  return agg.map(({ time, values }) => ({
    time: time,
    value: calculation(values.map(({ value }) => value)),
  }));
};

// groupByMinutes groups a set of points
export const groupByMinutes = (points: Point[], minutes: number, timeZone: string): PointSet[] => {
  // Create keys for interval start.
  const rounded = points.map((point) => {
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
export const groupByDay = (points: Point[]): PointSet[] => {
  const rounded = points.map((point) => ({
    [dateTime(point.time).startOf('day').valueOf()]: point,
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

export const defaultDisplay: DisplayProcessor = (value: any) => ({ numeric: value, text: value.toString() });
const minutesPerDay = 24 * 60;

// bucketize returns the main data structure used by the visualizations.
export const bucketize = (
  timeField: Field<number>,
  valueField: Field<number>,
  timeZone: string,
  timeRange: TimeRange,
  dailyInterval: [number, number]
): BucketData => {
  // Convert data frame fields to rows.
  const rows = Array.from({ length: timeField.values.length }, (_, i) => ({
    time: timeField.values.get(i),
    value: valueField.values.get(i),
  }));

  // Get the time range extents in the dashboard time zone.
  const extents = [
    dateTimeParse(timeRange.from.valueOf(), { timeZone }).startOf('day'),
    dateTimeParse(timeRange.to.valueOf(), { timeZone }).endOf('day'),
  ];

  const rowsWithinTimeRange = rows.filter((row) => {
    // Filter points within time range.
    const curr = dateTimeParse(row.time, { timeZone });
    return extents[0].valueOf() <= curr.valueOf() && curr.valueOf() < extents[1].valueOf();
  });

  const rowsWithinDailyInterval = rowsWithinTimeRange.filter((row) => {
    // Filter rows within interval.
    const dt = dateTimeParse(row.time, { timeZone });
    const hour = dt.hour ? dt.hour() : 0.0;
    return dailyInterval[0] <= hour && hour < dailyInterval[1];
  });

  // Extract the field configuration..
  const customData = valueField.config.custom;

  // Group and reduce values.
  const groupedByMinutes = groupByMinutes(rowsWithinDailyInterval, customData.groupBy, timeZone);
  const reducedMinutes = reduce(groupedByMinutes, calculations[customData.calculation]);

  const aggregatedPoints = groupByDay(reducedMinutes).flatMap(({ time, values }) =>
    values.map(({ time, value }) => ({
      dayMillis: time,
      bucketStartMillis: time,
      value,
    }))
  );

  recalculateMinMax(
    valueField,
    aggregatedPoints.map(({ value }) => value)
  );

  return {
    numBuckets: Math.floor(minutesPerDay / customData.groupBy),
    points: aggregatedPoints,
    valueField,
    timeField,
  };
};

// recalculateMinMax updates the field min and max to the extents of the
// aggregated values rather than the raw values.
//
// TODO: While this works, it feels like hacky. Is there a better way to do this?
const recalculateMinMax = (field: Field<number>, values: number[]) => {
  // Future versions of Grafana will change how the min and max are calculated.
  // For example, if Min or Max are set to auto, they will be undefined.
  //
  // Also, we should probably use getFieldConfigWithMinMax in the future:
  // https://github.com/grafana/grafana/blob/097dcc456a617bc67c3d5134e22adc00ad5b79c5/packages/grafana-data/src/field/scale.ts#L68
  const autoMin = !field.config.min || field.config.min === field.state?.calcs?.min;
  const autoMax = !field.config.max || field.config.max === field.state?.calcs?.max;

  if (autoMin) {
    field.config.min = d3.min(values);
  }
  if (autoMax) {
    field.config.max = d3.max(values);
  }

  field.display = getDisplayProcessor({
    field: field,
  });
};

// Lookup table for calculations.
const calculations: any = {
  mean: (vals: number[]) => d3.mean(vals),
  sum: (vals: number[]) => d3.sum(vals),
  count: (vals: number[]) => vals.length,
  min: (vals: number[]) => d3.min(vals),
  max: (vals: number[]) => d3.max(vals),
  first: (vals: number[]) => vals[0],
  last: (vals: number[]) => vals[vals.length - 1],
};
