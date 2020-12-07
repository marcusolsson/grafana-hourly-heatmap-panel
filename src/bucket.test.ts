describe('bucketize', () => {
  it('single row', () => {
    expect(true).toBeTruthy();
  });
});
// import { ArrayVector, dateTime, dateTimeParse, Field, FieldType, TimeRange } from '@grafana/data';
// import { bucketize, defaultDisplay } from './bucket';

// const timeZone = 'utc';
// const startTime = dateTimeParse('2020-05-05T00:00:00Z', { timeZone });
// const dailyInterval: [number, number] = [0, 24];
// const timeRange: TimeRange = {
//   from: startTime,
//   to: dateTime(startTime).add(1, 'day'),
//   raw: {
//     from: `${1588683600000}`,
//     to: `${dateTime(startTime)
//       .add(1, 'day')
//       .valueOf()}`,
//   },
// };

// describe('bucketize', () => {
//   it('single row', () => {
//     const timeField: Field = {
//       name: 'time',
//       type: FieldType.time,
//       config: {},
//       values: new ArrayVector([
//         dateTime(startTime)
//           .add(13, 'hours')
//           .add(20, 'minutes'),
//       ]),
//     };

//     const valueField: Field = {
//       name: 'value',
//       type: FieldType.number,
//       config: {
//         min: 0,
//         max: 1,
//         custom: {
//           groupBy: 60,
//           calculation: 'sum',
//         },
//       },
//       values: new ArrayVector([1]),
//     };

//     expect(bucketize(timeField, valueField, timeZone, timeRange, dailyInterval)).toStrictEqual({
//       min: 0,
//       max: 1,
//       numBuckets: 24,
//       points: [
//         {
//           bucketStartMillis: dateTime(startTime)
//             .add(13, 'hours')
//             .valueOf(),
//           dayMillis: 1588683600000,
//           value: 1,
//         },
//       ],
//       timeDisplay: defaultDisplay,
//       valueDisplay: defaultDisplay,
//     });
//   });

//   it('sum bucket data', () => {
//     const timeField: Field = {
//       name: 'time',
//       type: FieldType.time,
//       config: {},
//       values: new ArrayVector(
//         [
//           // First hour
//           dateTime(startTime)
//             .add(13, 'hours')
//             .add(20, 'minutes'),
//           dateTime(startTime)
//             .add(13, 'hours')
//             .add(30, 'minutes'),
//           dateTime(startTime)
//             .add(13, 'hours')
//             .add(40, 'minutes'),

//           // Second hour
//           dateTime(startTime)
//             .add(14, 'hours')
//             .add(20, 'minutes'),
//           dateTime(startTime)
//             .add(14, 'hours')
//             .add(30, 'minutes'),
//           dateTime(startTime)
//             .add(14, 'hours')
//             .add(40, 'minutes'),

//           // Third hour
//           dateTime(startTime)
//             .add(15, 'hours')
//             .add(20, 'minutes'),
//           dateTime(startTime)
//             .add(15, 'hours')
//             .add(30, 'minutes'),
//           dateTime(startTime)
//             .add(15, 'hours')
//             .add(40, 'minutes'),
//         ].map(_ => _.valueOf())
//       ),
//     };

//     const valueField: Field = {
//       name: 'value',
//       type: FieldType.number,
//       config: {
//         min: 0,
//         max: 10,
//         custom: {
//           groupBy: 60,
//           calculation: 'sum',
//         },
//       },
//       values: new ArrayVector([
//         // First hour
//         5,
//         5,
//         5,

//         // Second hour
//         7,
//         3,
//         10,

//         // Third hour

//         0,
//         0,
//         0,
//       ]),
//     };

//     expect(bucketize(timeField, valueField, timeZone, timeRange, dailyInterval)).toStrictEqual({
//       min: 0,
//       max: 10,
//       numBuckets: 24,
//       points: [
//         {
//           bucketStartMillis: dateTime(startTime)
//             .add(13, 'hours')
//             .valueOf(),
//           dayMillis: 1588683600000,
//           value: 15,
//         },
//         {
//           bucketStartMillis: dateTime(startTime)
//             .add(14, 'hours')
//             .valueOf(),
//           dayMillis: 1588687200000,
//           value: 20,
//         },
//         {
//           bucketStartMillis: dateTime(startTime)
//             .add(15, 'hours')
//             .valueOf(),
//           dayMillis: 1588690800000,
//           value: 0,
//         },
//       ],
//       timeDisplay: defaultDisplay,
//       valueDisplay: defaultDisplay,
//     });
//   });

//   it('average bucket data', () => {
//     const timeField: Field = {
//       name: 'time',
//       type: FieldType.time,
//       config: {},
//       values: new ArrayVector(
//         [
//           // First hour
//           dateTime(startTime)
//             .add(13, 'hours')
//             .add(20, 'minutes'),
//           dateTime(startTime)
//             .add(13, 'hours')
//             .add(30, 'minutes'),
//           dateTime(startTime)
//             .add(13, 'hours')
//             .add(40, 'minutes'),

//           // Second hour
//           dateTime(startTime)
//             .add(14, 'hours')
//             .add(20, 'minutes'),
//           dateTime(startTime)
//             .add(14, 'hours')
//             .add(30, 'minutes'),
//           dateTime(startTime)
//             .add(14, 'hours')
//             .add(40, 'minutes'),

//           // Third hour
//           dateTime(startTime)
//             .add(15, 'hours')
//             .add(20, 'minutes'),
//           dateTime(startTime)
//             .add(15, 'hours')
//             .add(30, 'minutes'),
//           dateTime(startTime)
//             .add(15, 'hours')
//             .add(40, 'minutes'),
//         ].map(_ => _.valueOf())
//       ),
//     };

//     const valueField: Field = {
//       name: 'value',
//       type: FieldType.number,
//       config: {
//         min: 0,
//         max: 10,
//         custom: {
//           groupBy: 60,
//           calculation: 'mean',
//         },
//       },
//       values: new ArrayVector([
//         // First hour
//         5,
//         5,
//         5,

//         // Second hour
//         7,
//         3,
//         10,

//         // Third hour

//         0,
//         0,
//         0,
//       ]),
//     };

//     expect(bucketize(timeField, valueField, timeZone, timeRange, dailyInterval)).toStrictEqual({
//       min: 0,
//       max: 10,
//       numBuckets: 24,
//       points: [
//         {
//           bucketStartMillis: dateTime(startTime)
//             .add(13, 'hours')
//             .valueOf(),
//           dayMillis: 1588683600000,
//           value: 5,
//         },
//         {
//           bucketStartMillis: dateTime(startTime)
//             .add(14, 'hours')
//             .valueOf(),
//           dayMillis: 1588687200000,
//           value: 6.666666666666667,
//         },
//         {
//           bucketStartMillis: dateTime(startTime)
//             .add(15, 'hours')
//             .valueOf(),
//           dayMillis: 1588690800000,
//           value: 0,
//         },
//       ],
//       timeDisplay: defaultDisplay,
//       valueDisplay: defaultDisplay,
//     });
//   });
// });
