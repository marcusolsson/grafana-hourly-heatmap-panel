import { ThresholdsConfig } from '@grafana/data';

type Calculation = 'mean' | 'sum' | 'count' | 'min' | 'max' | 'first' | 'last';

export interface HeatmapOptions {
  showLegend: boolean;
  from: string;
  to: string;
}

export interface HeatmapFieldConfig {
  colorScheme: string;

  // Options for custom color schemes.
  colorSpace: string;
  thresholds: ThresholdsConfig;

  // Options for reducing buckets.
  calculation: Calculation;
  groupBy: number;
}
