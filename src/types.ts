type ColorMode = 'spectrum' | 'custom';

type AggregationFunction = 'avg' | 'sum' | 'count' | 'min' | 'max' | 'first' | 'last';

interface SpectrumOptions {
  min: number;
  max: number;
  scheme: string;
}

export interface HeatmapOptions {
  mode: ColorMode;
  spectrum: SpectrumOptions;
  showLegend: boolean;
  from: string;
  to: string;
}

export interface HeatmapFieldConfig {
  aggregator: AggregationFunction;
  groupBy: number;
}
