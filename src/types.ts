import { ThresholdsConfig } from '@grafana/data';
import { TimeRegion } from './components/TimeRegionEditor';

export type Quality = 'low' | 'medium' | 'high';
export type Calculation = 'mean' | 'sum' | 'count' | 'min' | 'max' | 'first' | 'last';

export interface HeatmapOptions {
  // Dimensions
  timeFieldName?: string;
  valueFieldName?: string;

  // Display
  from: string;
  to: string;
  regions: TimeRegion[];
  showCellBorder: boolean;
  showTooltip: boolean;

  // Legend
  showLegend: boolean;
  showValueIndicator: boolean;
  legendGradientQuality: Quality;
}

export interface HeatmapFieldConfig {
  colorPalette: string;
  invertPalette: boolean;
  nullValueColor: string;

  // Options for custom color palettes.
  colorSpace: string;
  thresholds: ThresholdsConfig;

  // Options for reducing buckets.
  calculation: Calculation;
  groupBy: number;
}
