import { PanelPlugin } from '@grafana/data';
import {
  FieldType,
  FieldConfigProperty,
  dateTime,
  standardEditorsRegistry,
  thresholdsOverrideProcessor,
} from '@grafana/data';
import { HeatmapOptions, HeatmapFieldConfig } from './types';
import { HeatmapPanel } from './HeatmapPanel';

import * as d3 from 'd3';

const modeSelected = (mode: string) => (config: HeatmapFieldConfig) => config.mode === mode;

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
              { value: 15, label: '15 minutes' },
              { value: 30, label: '30 minutes' },
              { value: 60, label: '60 minutes' },
            ],
          },
          defaultValue: 60,
        })
        .addSelect({
          path: 'mode',
          name: 'Mode',
          settings: {
            options: [
              { value: 'spectrum', label: 'Spectrum' },
              { value: 'custom', label: 'Custom' },
            ],
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
        .addSelect({
          path: 'custom.colorSpace',
          name: 'Color space',
          settings: {
            options: [
              { value: 'rgb', label: 'RGB' },
              { value: 'hsl', label: 'HSL' },
              { value: 'hcl', label: 'HCL' },
              { value: 'lab', label: 'Lab' },
              { value: 'cubehelix', label: 'Cubehelix' },
            ],
          },
          showIf: modeSelected('custom'),
          defaultValue: 'rgb',
        })
        .addCustomEditor({
          id: 'custom.thresholds',
          path: 'custom.thresholds',
          name: 'Thresholds',
          editor: standardEditorsRegistry.get('thresholds').editor as any,
          override: standardEditorsRegistry.get('thresholds').editor as any,
          process: thresholdsOverrideProcessor,
          shouldApply: field => field.type === FieldType.number,
          showIf: modeSelected('custom'),
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
        path: 'from',
        name: 'From',
        description: '',
        settings: {
          options: d3.range(0, 24, 1).map(h => ({
            label: dateTime()
              .startOf('day')
              .add(h, 'hour')
              .format('HH:mm'),
            value: `${h}`,
          })),
        },
        defaultValue: '0',
      })
      .addSelect({
        path: 'to',
        name: 'To',
        settings: {
          options: d3.range(0, 24, 1).map(h => ({
            label: dateTime()
              .startOf('day')
              .add(h, 'hour')
              .format('HH:mm'),
            value: `${h}`,
          })),
        },
        defaultValue: '0',
      })
      .addBooleanSwitch({
        path: 'showLegend',
        name: 'Show legend',
        defaultValue: true,
      });
  });

const colorSchemes = [
  // Diverging
  { label: 'Spectral', value: 'interpolateSpectral' },
  { label: 'RdYlGn', value: 'interpolateRdYlGn' },

  // Sequential (Single Hue)
  { label: 'Blues', value: 'interpolateBlues' },
  { label: 'Greens', value: 'interpolateGreens' },
  { label: 'Greys', value: 'interpolateGreys' },
  { label: 'Oranges', value: 'interpolateOranges' },
  { label: 'Purples', value: 'interpolatePurples' },
  { label: 'Reds', value: 'interpolateReds' },

  // Sequential (Multi-Hue)
  { label: 'BuGn', value: 'interpolateBuGn' },
  { label: 'BuPu', value: 'interpolateBuPu' },
  { label: 'GnBu', value: 'interpolateGnBu' },
  { label: 'OrRd', value: 'interpolateOrRd' },
  { label: 'PuBuGn', value: 'interpolatePuBuGn' },
  { label: 'PuBu', value: 'interpolatePuBu' },
  { label: 'PuRd', value: 'interpolatePuRd' },
  { label: 'RdPu', value: 'interpolateRdPu' },
  { label: 'YlGnBu', value: 'interpolateYlGnBu' },
  { label: 'YlGn', value: 'interpolateYlGn' },
  { label: 'YlOrBr', value: 'interpolateYlOrBr' },
  { label: 'YlOrRd', value: 'interpolateYlOrRd' },
];
