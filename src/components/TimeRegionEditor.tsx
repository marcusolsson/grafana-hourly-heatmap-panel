import React, { useState } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { useTheme, Input, ColorPicker, Field, Button, Icon, IconButton, HorizontalGroup } from '@grafana/ui';
import {} from '@emotion/core';
import { css } from 'emotion';

interface Props extends StandardEditorProps<TimeRegion[], Settings> {}

type Time = {
  hour: number;
  minute: number;
};

const formatTime = (time: Time) =>
  (time.hour > 9 ? '' + time.hour : '0' + time.hour) + ':' + (time.minute > 9 ? '' + time.minute : '0' + time.minute);

const parseTime = (str: string) => {
  const pair = str.split(':');

  const hour = Number.parseInt(pair[0], 10);
  const minute = Number.parseInt(pair[1], 10);

  return {
    hour: isNaN(hour) ? 0 : hour,
    minute: isNaN(minute) ? 0 : minute,
  };
};

export type TimeRegion = {
  start: Time;
  end: Time;

  color: string;
};

interface Settings {}

export const TimeRegionEditor: React.FC<Props> = ({ value, onChange }) => {
  const onRegionChange = (index: number) => (region: TimeRegion) => {
    value[index] = region;
    onChange(value);
  };

  const onRegionRemove = (index: number) => () => {
    value.splice(index, 1);
    onChange(value);
  };

  return (
    <div>
      {(value || []).map((region, index) => {
        return (
          <TimeRegionInput
            key={index}
            value={region}
            onChange={onRegionChange(index)}
            onRemove={onRegionRemove(index)}
          />
        );
      })}
      <Button
        variant="secondary"
        onClick={() => {
          if (value) {
            onChange([
              ...value,
              {
                start: { hour: 2, minute: 0 },
                end: { hour: 12, minute: 0 },
                color: 'rgba(242, 73, 92, 0.5)',
              },
            ]);
          } else {
            onChange([
              {
                start: { hour: 2, minute: 0 },
                end: { hour: 12, minute: 0 },
                color: 'rgba(242, 73, 92, 0.5)',
              },
            ]);
          }
        }}
      >
        Add region
      </Button>
    </div>
  );
};

interface TimeRegionInputProps {
  value: TimeRegion;
  onChange: (value: TimeRegion) => void;
  onRemove: () => void;
}

const TimeRegionInput: React.FC<TimeRegionInputProps> = ({ value, onChange, onRemove }) => {
  const theme = useTheme();
  const [from, setFrom] = useState(formatTime(value.start));
  const [to, setTo] = useState(formatTime(value.end));

  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={css`
        padding: ${theme.spacing.sm};
        background-color: ${theme.colors.bg2};
        border-radius: ${theme.border.radius.sm};
        margin-bottom: ${theme.spacing.sm};
      `}
    >
      <div
        className={css`
          display: flex;
          align-items: center;
        `}
      >
        <span
          onClick={() => {
            setExpanded(!expanded);
          }}
          className={css`
            flex-grow: 1;
            cursor: pointer;
            margin-right: ${theme.spacing.xs};
            display: flex;
            color: ${theme.colors.link};
            &:hover {
              color: ${theme.colors.linkHover};
            }
          `}
        >
          <Icon
            name={expanded ? 'angle-down' : 'angle-right'}
            className={css`
              margin-right: ${theme.spacing.xs};
            `}
          />
          <div>{`${from}–${to}`}</div>
        </span>
        <div style={{ marginRight: theme.spacing.sm }}>
          <ColorPicker color={value.color ?? '#ffffff'} onChange={(color) => onChange({ ...value, color })} />
        </div>
        <IconButton
          name="trash-alt"
          onClick={() => {
            onRemove();
          }}
        />
      </div>
      {expanded ? (
        <div
          className={css`
            margin-top: ${theme.spacing.sm};
          `}
        >
          <HorizontalGroup spacing="xs">
            <Field label="From">
              <Input
                placeholder="hh:mm"
                value={from}
                onBlur={() => {
                  const start = parseTime(from);
                  onChange({ ...value, start });
                  setFrom(formatTime(start));
                }}
                onChange={(e) => setFrom(e.currentTarget.value)}
                className={css`
                  max-width: 64px;
                `}
              />
            </Field>
            <Field label="To">
              <Input
                placeholder="hh:mm"
                value={to}
                onBlur={() => {
                  const end = parseTime(to);
                  onChange({ ...value, end });
                  setTo(formatTime(end));
                }}
                onChange={(e) => setTo(e.currentTarget.value)}
                className={css`
                  max-width: 64px;
                `}
              />
            </Field>
          </HorizontalGroup>
        </div>
      ) : null}
    </div>
  );
};
