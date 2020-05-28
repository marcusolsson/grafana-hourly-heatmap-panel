import { ThresholdsConfig } from '@grafana/data';

type ColorMode = 'spectrum' | 'custom';

type AggregationFunction = 'avg' | 'sum' | 'count' | 'min' | 'max' | 'first' | 'last';

interface SpectrumOptions {
  min: number;
  max: number;
  scheme: string;
}

export interface CustomOptions {
  colorSpace: string;
  thresholds: ThresholdsConfig;
}

export interface HeatmapOptions {
  showLegend: boolean;
  from: string;
  to: string;
}

export interface HeatmapFieldConfig {
  mode: ColorMode;
  spectrum: SpectrumOptions;
  custom: CustomOptions;
  aggregator: AggregationFunction;
  groupBy: number;
}
