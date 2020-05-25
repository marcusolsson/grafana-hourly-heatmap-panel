import { PanelPlugin, FieldConfigProperty } from '@grafana/data';
import { HeatmapOptions, HeatmapFieldConfig } from './types';
import { HeatmapPanel } from './HeatmapPanel';

const modeSelected = (mode: string) => (config: HeatmapOptions) => config.mode === mode;

export const plugin = new PanelPlugin<HeatmapOptions, HeatmapFieldConfig>(HeatmapPanel)
  .useFieldConfig({
    useCustomConfig: builder => {
      builder
        .addSelect({
          path: 'data.aggregator',
          name: 'Aggregator',
          settings: {
            options: [
              { value: 'avg', label: 'Average' },
              { value: 'sum', label: 'Sum' },
              { value: 'count', label: 'Count' },
              { value: 'min', label: 'Min' },
              { value: 'max', label: 'Max' },
              { value: 'first', label: 'First' },
              { value: 'last', label: 'Last' },
            ],
          },
          defaultValue: 'avg',
        })
        .addSelect({
          path: 'data.groupBy',
          name: 'Group by',
          settings: {
            options: [
              { value: 1, label: '1 minute' },
              { value: 5, label: '5 minutes' },
              { value: 10, label: '10 minutes' },
              { value: 15, label: '15 minutes' },
              { value: 30, label: '30 minutes' },
              { value: 60, label: '60 minutes' },
            ],
          },
          defaultValue: 60,
        });
    },
    standardOptions: [
      FieldConfigProperty.Min,
      FieldConfigProperty.Max,
      FieldConfigProperty.Decimals,
      FieldConfigProperty.Unit,
    ],
  })
  .setPanelOptions(builder => {
    return builder
      .addSelect({
        path: 'mode',
        name: 'Mode',
        settings: {
          options: [{ value: 'spectrum', label: 'Spectrum' }],
        },
        defaultValue: 'spectrum',
      })
      .addSelect({
        path: 'spectrum.scheme',
        name: 'Color scheme',
        settings: {
          options: colorSchemes,
        },
        showIf: modeSelected('spectrum'),
        defaultValue: 'interpolateSpectral',
      })
      .addBooleanSwitch({
        path: 'showLegend',
        name: 'Show legend',
        defaultValue: true,
      });
  });

const colorSchemes = [
  // Diverging
  { label: 'Spectral', value: 'interpolateSpectral', invert: 'always' },
  { label: 'RdYlGn', value: 'interpolateRdYlGn', invert: 'always' },

  // Sequential (Single Hue)
  { label: 'Blues', value: 'interpolateBlues', invert: 'dark' },
  { label: 'Greens', value: 'interpolateGreens', invert: 'dark' },
  { label: 'Greys', value: 'interpolateGreys', invert: 'dark' },
  { label: 'Oranges', value: 'interpolateOranges', invert: 'dark' },
  { label: 'Purples', value: 'interpolatePurples', invert: 'dark' },
  { label: 'Reds', value: 'interpolateReds', invert: 'dark' },

  // Sequential (Multi-Hue)
  { label: 'BuGn', value: 'interpolateBuGn', invert: 'dark' },
  { label: 'BuPu', value: 'interpolateBuPu', invert: 'dark' },
  { label: 'GnBu', value: 'interpolateGnBu', invert: 'dark' },
  { label: 'OrRd', value: 'interpolateOrRd', invert: 'dark' },
  { label: 'PuBuGn', value: 'interpolatePuBuGn', invert: 'dark' },
  { label: 'PuBu', value: 'interpolatePuBu', invert: 'dark' },
  { label: 'PuRd', value: 'interpolatePuRd', invert: 'dark' },
  { label: 'RdPu', value: 'interpolateRdPu', invert: 'dark' },
  { label: 'YlGnBu', value: 'interpolateYlGnBu', invert: 'dark' },
  { label: 'YlGn', value: 'interpolateYlGn', invert: 'dark' },
  { label: 'YlOrBr', value: 'interpolateYlOrBr', invert: 'dark' },
  { label: 'YlOrRd', value: 'interpolateYlOrRd', invert: 'darm' },
];
