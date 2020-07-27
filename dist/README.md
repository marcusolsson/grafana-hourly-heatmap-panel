# Hourly Heatmap for Grafana

[![CircleCI](https://circleci.com/gh/marcusolsson/grafana-hourly-heatmap-panel.svg?style=svg)](https://circleci.com/gh/marcusolsson/grafana-hourly-heatmap-panel)
[![License](https://img.shields.io/github/license/marcusolsson/grafana-hourly-heatmap-panel)](LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contribute)

A panel plugin for [Grafana](https://grafana.com) to visualize hourly heatmaps.

An hourly heatmap aggregates data into buckets by day and hour to analyze activity or traffic during the day.

![Screenshot](https://raw.githubusercontent.com/marcusolsson/grafana-hourly-heatmap-panel/master/docs/screenshot.png)

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

#### Standard options

- **Min** and **Max** sets the interval used for color mapping. Any data outside this interval will be clamped.
- **Decimals** and **Unit** sets the textual format of each value.

## Motivation

The [carpet-plot](https://github.com/petrslavotinek/grafana-carpetplot) panel plugin is one of the most used plugins for Grafana. Unfortunately, it's no longer being actively maintained.

Grafana 7.0 introduced a new plugin architecture based on React. Instead of migrating the original plugin from Angular, this is completely rewritten from scratch, using inspiration from the original plugin.

## License

This plugin is licensed under the [Apache 2.0 License](LICENSE).
