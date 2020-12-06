import { ThresholdsConfig } from '@grafana/data';
import { TimeRegion } from './TimeRegionEditor';

type Calculation = 'mean' | 'sum' | 'count' | 'min' | 'max' | 'first' | 'last';

export interface HeatmapOptions {
  from: string;
  to: string;
  regions: TimeRegion[];

  // Legend
  showLegend: boolean;
  showValueIndicator: boolean;
}

export interface HeatmapFieldConfig {
  colorPalette: string;
  invertPalette: boolean;

  // Options for custom color palettes.
  colorSpace: string;
  thresholds: ThresholdsConfig;

  // Options for reducing buckets.
  calculation: Calculation;
  groupBy: number;
}
