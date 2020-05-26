import { group, Point } from './bucket';
const moment = require('moment');

// Just a stub test
describe('placeholder test', () => {
  it('should return true', () => {
    const points: Point[] = [];
    points.push({ time: moment('2020-05-01 22:20').valueOf(), value: 1 });
    points.push({ time: moment('2020-05-01 22:40').valueOf(), value: 2 });
    points.push({ time: moment('2020-05-01 23:20').valueOf(), value: 3 });
    points.push({ time: moment('2020-05-02 00:30').valueOf(), value: 4 });
    points.push({ time: moment('2020-05-02 01:30').valueOf(), value: 5 });
    const agg = group(points, 60);

    expect(agg).toStrictEqual([
      {
        time: moment('2020-05-01 22:00').valueOf(),
        values: [
          { time: moment('2020-05-01 22:20').valueOf(), value: 1 },
          { time: moment('2020-05-01 22:40').valueOf(), value: 2 },
        ],
      },
      {
        time: moment('2020-05-01 23:00').valueOf(),
        values: [{ time: moment('2020-05-01 23:20').valueOf(), value: 3 }],
      },
      {
        time: moment('2020-05-02 00:00').valueOf(),
        values: [{ time: moment('2020-05-02 00:30').valueOf(), value: 4 }],
      },
      {
        time: moment('2020-05-02 01:00').valueOf(),
        values: [{ time: moment('2020-05-02 01:30').valueOf(), value: 5 }],
      },
    ]);
  });
});
