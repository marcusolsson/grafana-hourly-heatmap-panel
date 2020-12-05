# Hourly Heatmap for Grafana

[![Build](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/workflows/CI/badge.svg)](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/actions?query=workflow%3A%22CI%22)
[![Release](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/workflows/Release/badge.svg)](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/actions?query=workflow%3ARelease)
[![Marketplace](https://img.shields.io/badge/dynamic/json?color=orange&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22marcusolsson-hourly-heatmap-panel%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/marcusolsson-hourly-heatmap-panel)
[![Downloads](https://img.shields.io/badge/dynamic/json?color=orange&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22marcusolsson-hourly-heatmap-panel%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/marcusolsson-hourly-heatmap-panel)
[![License](https://img.shields.io/github/license/marcusolsson/grafana-hourly-heatmap-panel)](LICENSE)

A panel plugin for [Grafana](https://grafana.com) to visualize hourly heatmaps.

An hourly heatmap aggregates data into buckets by day and hour to analyze activity or traffic during the day.

![Screenshot](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/raw/master/src/img/screenshot.png)

## Motivation

The [carpet-plot](https://github.com/petrslavotinek/grafana-carpetplot) panel plugin is one of the most used plugins for Grafana. Unfortunately, it's no longer being actively maintained.

Grafana 7.0 introduced a new plugin architecture based on React. Instead of migrating the original plugin from Angular, this is completely rewritten from scratch, using inspiration from the original plugin.

## Configuration

### Query

The Hourly Heatmap panel expects a query that returns a **time** field, and a **number** field.

The name of each field doesn't matter—the panel selects the first field of each required type.

### Display options

- **From** and **To** lets you choose the hours to display. This can be used to set working hours, or to filter parts of the day with low traffic.
- **Show legend** toggles the color spectrum.

### Field options

#### Custom options

- **Group by** sets the size of each bucket.
- **Calculation** sets calculation to use for reducing data within a bucket.
- **Color palette** sets the colors to use for the heatmap. Select from any of the predefined color palettes, or select **Custom** to create your own.
- **Invert color palette** inverts the currently selected color palette.

#### Standard options

- **Min** and **Max** sets the interval used for color mapping. Any data outside this interval will be clamped.
- **Decimals** and **Unit** sets the textual format of each value.

## Troubleshooting

### Missing data

By default, data sources limits the number of data points to the width of the panel, in pixels. If you're visualizing data over a long time, then you may need to adjust the **Max data points** under **Query options** in the query editor.

![Missing data](https://github.com/marcusolsson/grafana-hourly-heatmap-panel/raw/master/src/img/missing-datapoints.png)
