import { PanelPlugin } from '@grafana/data';
import {
  FieldType,
  FieldConfigProperty,
  dateTime,
  standardEditorsRegistry,
  thresholdsOverrideProcessor,
} from '@grafana/data';
import { hasCapability, standardOptionsCompat } from 'grafana-plugin-support';
import { HeatmapOptions, HeatmapFieldConfig } from './types';
import { HeatmapPanel } from './HeatmapPanel';
import { TimeRegionEditor } from './components/TimeRegionEditor';

import { FieldSelectEditor, getPanelPluginOrFallback } from 'grafana-plugin-support';
import * as d3 from 'd3';

const paletteSelected = (colorPalette: string) => (config: HeatmapFieldConfig) => config.colorPalette === colorPalette;

const buildStandardOptions = (): any => {
  const options = [
    FieldConfigProperty.Min,
    FieldConfigProperty.Max,
    FieldConfigProperty.Decimals,
    FieldConfigProperty.Unit,
  ];

  if (hasCapability('color-scheme')) {
    options.push(FieldConfigProperty.Color);
    options.push(FieldConfigProperty.Thresholds);
  }

  return standardOptionsCompat(options);
};

const buildColorPaletteOptions = () => {
  const options: Array<{ label: string; value: string; description?: string }> = [
    { value: 'custom', label: 'Custom', description: 'Define a custom color palette' },
  ];

  if (hasCapability('color-scheme')) {
    options.push({
      value: 'fieldOptions',
      label: 'Field options',
      description: 'Use color from field options (available from Grafana 7.3)',
    });
  }

  return options.concat([...predefinedColorPalettes]);
};

export const plugin = getPanelPluginOrFallback(
  'marcusolsson-hourly-heatmap-panel',
  new PanelPlugin<HeatmapOptions, HeatmapFieldConfig>(HeatmapPanel)
    .useFieldConfig({
      useCustomConfig: (builder) => {
        builder
          .addSelect({
            path: 'groupBy',
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
            path: 'calculation',
            name: 'Calculation',
            settings: {
              options: [
                { value: 'mean', label: 'Mean' },
                { value: 'sum', label: 'Sum' },
                { value: 'count', label: 'Count' },
                { value: 'min', label: 'Min' },
                { value: 'max', label: 'Max' },
                { value: 'first', label: 'First' },
                { value: 'last', label: 'Last' },
              ],
            },
            defaultValue: 'mean',
          })
          .addSelect({
            path: 'colorPalette',
            name: 'Color palette',
            settings: {
              options: buildColorPaletteOptions(),
            },
            defaultValue: 'interpolateSpectral',
          })
          .addBooleanSwitch({
            path: 'invertPalette',
            name: 'Invert color palette',
            defaultValue: false,
            showIf: (config: HeatmapFieldConfig) =>
              config.colorPalette !== 'custom' && config.colorPalette !== 'fieldOptions',
          })
          .addColorPicker({
            path: 'nullValueColor',
            name: 'Null Value Color',
            defaultValue: 'rgb(155, 155, 155)',
          })
          .addSelect({
            path: 'colorSpace',
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
            showIf: paletteSelected('custom'),
            defaultValue: 'rgb',
          })
          .addCustomEditor({
            id: 'thresholds',
            path: 'thresholds',
            name: 'Thresholds',
            editor: standardEditorsRegistry.get('thresholds').editor as any,
            override: standardEditorsRegistry.get('thresholds').editor as any,
            process: thresholdsOverrideProcessor,
            shouldApply: (field) => field.type === FieldType.number,
            showIf: paletteSelected('custom'),
          });
      },
      standardOptions: buildStandardOptions(),
    })
    .setPanelOptions((builder) => {
      return builder
        .addCustomEditor({
          id: 'timeFieldName',
          path: 'timeFieldName',
          name: 'Time',
          description: 'Defaults to the first time field.',
          category: ['Dimensions'],
          editor: FieldSelectEditor,
          settings: {
            filterByType: [FieldType.time],
          },
        })
        .addCustomEditor({
          id: 'valueFieldName',
          path: 'valueFieldName',
          name: 'Value',
          description: 'Defaults to the first number field.',
          category: ['Dimensions'],
          editor: FieldSelectEditor,
          settings: {
            filterByType: [FieldType.number],
          },
        })
        .addBooleanSwitch({
          path: 'showCellBorder',
          name: 'Show cell border',
          description: 'Display a border around each cell',
          defaultValue: false,
        })
        .addBooleanSwitch({
          path: 'showTooltip',
          name: 'Show tooltip',
          description:
            "Display a tooltip for the value under the cursor. Currently, this severely impacts performance. It's recommended to disable this for large time intervals.",
          defaultValue: true,
        })
        .addSelect({
          path: 'from',
          name: 'From',
          description: 'Hide values before this hour',
          settings: {
            options: d3.range(0, 24, 1).map((h) => ({
              label: dateTime().startOf('day').add(h, 'hour').format('HH:mm'),
              value: `${h}`,
            })),
          },
          defaultValue: '0',
        })
        .addSelect({
          path: 'to',
          name: 'To',
          description: 'Hide values after this hour',
          settings: {
            options: d3.range(0, 24, 1).map((h) => ({
              label: dateTime().startOf('day').add(h, 'hour').format('HH:mm'),
              value: `${h}`,
            })),
          },
          defaultValue: '0',
        })
        .addCustomEditor({
          id: 'regions',
          path: 'regions',
          name: 'Time regions',
          description: 'Highlight time regions during the day',
          editor: TimeRegionEditor,
        })
        .addBooleanSwitch({
          path: 'showLegend',
          name: 'Show legend',
          defaultValue: true,
          category: ['Legend'],
        })
        .addBooleanSwitch({
          path: 'showValueIndicator',
          name: 'Show value indicator',
          description: 'Displays an indicator for the value under the cursor',
          defaultValue: false,
          category: ['Legend'],
        })
        .addSelect({
          path: 'legendGradientQuality',
          name: 'Gradient quality',
          description: 'Higher quality means more elements on screen. Reduce quality if the panel is slow.',
          defaultValue: 'high',
          category: ['Legend'],
          settings: {
            options: [
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ],
          },
        });
    })
);

const predefinedColorPalettes = [
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
