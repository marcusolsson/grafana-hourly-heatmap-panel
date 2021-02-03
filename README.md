# Hourly Heatmap for Grafana

[![Build](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/workflows/CI/badge.svg)](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/actions?query=workflow%3A%22CI%22)
[![Release](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/workflows/Release/badge.svg)](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/actions?query=workflow%3ARelease)
[![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22marcusolsson-hourly-heatmap-panel%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/marcusolsson-hourly-heatmap-panel)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22marcusolsson-hourly-heatmap-panel%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/marcusolsson-hourly-heatmap-panel)
[![License](https://img.shields.io/github/license/marcusolsson/grafana-hourly-heatmap-panel)](LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/marcusolsson?color=%231DA1F2&label=twitter&style=plastic)](https://twitter.com/marcusolsson)

A panel plugin for [Grafana](https://grafana.com) to visualize hourly heatmaps.

An hourly heatmap aggregates data into buckets by day and hour to analyze activity or traffic during the day.

![Screenshot](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/raw/main/src/img/screenshot.png)

## Motivation

The [carpet-plot](https://github.com/petrslavotinek/grafana-carpetplot) panel plugin is one of the most used plugins for Grafana. Unfortunately, it's no longer being actively maintained.

Grafana 7.0 introduced a new plugin architecture based on React. Instead of migrating the original plugin from Angular, this is completely rewritten from scratch, using inspiration from the original plugin.

## Configuration

This section lists the available configuration options for the JSON API data source.

### Panel options

#### Dimensions

| Option | Description |
|--------|-------------|
| _Time_ | Name of the field to use for time. Defaults to the first time field. |
| _Value_ | Name of the field to use for value. Defaults to the first number field. |

#### Display

| Option | Description |
|--------|-------------|
| _Show cell border_ | Toggles a cell border to make it easier to distinguish cells with similar values
| _Show tooltip_ | Toggles the tooltip. Due to the current tooltip implementation, this severely impacts performance and I recommend that you disable this for large time intervals. For more information, refer to [#12](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/issues/12).
| _From_ and _To_ | Lets you choose the hours to display. This can be used to set working hours, or to filter parts of the day with low traffic |

#### Legend

| Option | Description |
|--------|-------------|
| _Show legend_ | Toggles the color spectrum |
| _Show value indicator_ | Toggles an indicator that shows the current value in the legend |
| _Gradient quality_ | Determines the quality of the color spectrum. Higher quality means more SVG elements being drawn. Reduce the quality if you experience degraded performance. |

### Field options

| Option | Description |
|--------|-------------|
| _Group by_ | Size of each bucket |
| _Calculation_ | Calculation to use for reducing data within a bucket |
| _Color palette_ | Colors to use for the heatmap. Select from any of the predefined color palettes, or select **Custom** to create your own. Select **Field options** to use the colors from the built-in **Color scheme** field option |
| _Invert color palette_ | Inverts the currently selected color palette |

## Troubleshooting

### Missing data

By default, data sources limits the number of data points to the width of the panel in pixels. If you're visualizing data over a long time, then you may need to adjust the **Max data points** under **Query options** in the query editor.

![Missing data](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/raw/main/src/img/missing-datapoints.png)
