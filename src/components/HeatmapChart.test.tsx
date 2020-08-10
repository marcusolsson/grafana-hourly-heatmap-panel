import React from 'react';
import { render } from '@testing-library/react';
import { makeSpectrumColorScale } from '../colors';
import { dateTime } from '@grafana/data';

import { HeatmapChart } from './HeatmapChart';

describe('HeatmapChart', () => {
  it('renders the component', () => {
    const numDays = 7;
    const points = [];
    for (let d = 0; d < numDays; d++) {
      for (let h = 0; h < 24; h++) {
        points.push({
          dayMillis: dateTime('2020-05-20T00:00:00Z')
            .add(d, 'day')
            .valueOf(),
          bucketStartMillis: dateTime('2020-05-20T00:00:00Z')
            .add(h, 'hour')
            .valueOf(),
          value: d * h,
        });
      }
    }
    const colorScale = makeSpectrumColorScale('interpolateSpectral', 0, numDays * 24, true);
    const data = {
      numBuckets: 24,
      min: 0,
      max: numDays * 24,
      displayProcessor: (t: number) => ({ numeric: t, text: t.toString() }),
      points: points,
    };

    const { asFragment } = render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <HeatmapChart
          width={1000}
          height={500}
          timeZone="utc"
          data={data}
          dailyInterval={[0, 24]}
          colorScale={colorScale}
        />
      </svg>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
