import React from 'react';
import { render } from '@testing-library/react';
import { makeSpectrumColorScale } from '../colors';

import { Legend } from './Legend';

describe('Legend', () => {
  it('renders the component', () => {
    const colorScale = makeSpectrumColorScale('interpolateSpectral', 0, 100, true);
    const display = (t: number) => ({ numeric: t, text: t.toString() });

    const { asFragment } = render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <Legend width={300} height={100} colorScale={colorScale} min={0} max={100} display={display} />
      </svg>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
