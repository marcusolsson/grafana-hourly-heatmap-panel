# Hourly Heatmap for Grafana

[![CircleCI](https://circleci.com/gh/marcusolsson/grafana-hourly-heatmap-panel.svg?style=svg)](https://circleci.com/gh/marcusolsson/grafana-hourly-heatmap-panel)
[![License](https://img.shields.io/github/license/marcusolsson/grafana-hourly-heatmap-panel)](LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contribute)

A panel plugin for [Grafana](https://grafana.com) to visualize hourly heatmaps.

An hourly heatmap aggregates data into buckets by day and hour to analyze activity or traffic during the day.

<img src="https://github.com/marcusolsson/grafana-heatmap-panel/blob/master/docs/screenshot.png" />

## Motivation

The [carpet-plot](https://github.com/petrslavotinek/grafana-carpetplot) panel plugin is one of the most used plugins for Grafana. Unfortunately, it's no longer being actively maintained.

Grafana 7.0 introduced a new plugin architecture based on React. Instead of migrating the original plugin from Angular, this is completely rewritten from scratch, using inspiration from the original plugin.

## License

This plugin is licensed under the [Apache 2.0 License](LICENSE).
