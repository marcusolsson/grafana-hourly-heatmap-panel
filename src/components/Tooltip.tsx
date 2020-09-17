import React from 'react';
import { DisplayValue, DateTime } from '@grafana/data';

const minutesPerDay = 24 * 60;

interface TooltipProps {
  bucketStartTime: DateTime;
  displayValue: DisplayValue;
  numBuckets: number;
  tz: string;
}

// Generates a tooltip for a data point.
export const Tooltip: React.FC<TooltipProps> = ({ bucketStartTime, displayValue, numBuckets, tz }) => {
  const localeOptionsDate = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: tz === 'browser' ? undefined : tz,
  };
  const localeOptionsTime = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz === 'browser' ? undefined : tz,
    timeZoneName: 'short',
  };

  const bucketDate = bucketStartTime.toDate().toLocaleDateString(undefined, localeOptionsDate);
  const bucketStart = bucketStartTime.toDate().toLocaleTimeString(undefined, localeOptionsTime);
  const bucketEnd = bucketStartTime
    .add(minutesPerDay / numBuckets, 'minute')
    .toDate()
    .toLocaleTimeString(undefined, localeOptionsTime);

  return (
    <div>
      <div>{bucketDate}</div>
      <div>
        {bucketStart}&#8211;{bucketEnd}:{' '}
        <strong>
          {displayValue.text}
          {displayValue.suffix ? displayValue.suffix : null}
        </strong>
      </div>
    </div>
  );
};
