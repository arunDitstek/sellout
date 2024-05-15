import * as moment from 'moment-timezone';

export const SECOND = 1;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

// export const MILLISECONDS = {
//   SECOND: 1000,
//   MINUTE: this.SECOND * 60,
//   HOUR: this.MINUTE * 60,
//   DAY: this.HOUR * 24,
// };
export const MILLISECONDS = {
  SECOND: 1000,
  MINUTE: SECOND * 60,
  HOUR: MINUTE * 60,
  DAY: HOUR * 24,
};

export function now(): number {
  return moment().unix();
};

export function fromNow(seconds): number {
  return now() + seconds;
}

export function fromStartOfDay(seconds: number): number {
  const startOfDay = moment().startOf("day").unix();
  return Math.floor(startOfDay + seconds);
}

export const date = function (seconds?: number): Date {
  if (!seconds) return new Date();
  const millis = seconds * 1000;
  return new Date(millis);
}

export const fromDate = function (millis: number | string): number {
  return Math.floor(new Date(millis).getTime() / 1000);
}


// Use this one, it's better
export const format = function (secondsSinceEpoch, format = 'M/DD/YYYY h:mma', timezone: string = 'America/Denver') {
  if (!timezone) timezone = 'America/Denver';
  const millis = date(secondsSinceEpoch);
  return moment(millis).tz(timezone).format(format);
}
export const formatToUTC = function (secondsSinceEpoch, format = 'M/DD/YYYY h:mma') {
  const millis = date(secondsSinceEpoch);
  return moment.utc(millis).format(format);
}

export const formatTimeOfDay = function (secondsSinceEpoch, timezone?: string) {
  return format(secondsSinceEpoch, 'h:mma', timezone);
}

export const formattedCountDown = (startTime: number, endTime: number): string => {
  const totalSeconds = endTime - startTime;
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor(((totalSeconds % 86400) % 3600) / 60);
  const seconds = Math.floor((((totalSeconds % 86400) % 3600) % 60));

  if (days === 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (hours === 0 && days === 0) return `${minutes}m ${seconds}s`;
  if (minutes === 0 && hours === 0 && days === 0) return `${seconds}s`;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export const getStartOfHour = (seconds: number) => {
  return moment(seconds * 1000).startOf("hour").unix();
}

export const getStartOfDay = (seconds: number) => {
  return moment(seconds * 1000).startOf("day").unix();
}

export const getStartOfWeek = (seconds: number) => {
  return moment(seconds * 1000).startOf("week").unix();
}

export const getStartOfMonth = (seconds: number) => {
  return moment(seconds * 1000).startOf("month").unix();
}

export const getStartOfYear = (seconds: number) => {
  return moment(seconds * 1000).startOf("year").unix();
}


export const getStartOfCurrentDay = () => {
  return moment().startOf("day").unix();
}

export const getStartOfCurrentMonth = () => {
  return moment().startOf("month").unix();
}

export const getStartOfCurrentYear = () => {
  return moment().startOf("year").unix();
}

export const getEndOfCurrentDay = () => {
  return moment().endOf("day").unix();
}

export const getEndOfCurrentMonth = () => {
  return moment().endOf("month").unix();
}

export const getEndOfCurrentYear = () => {
  return moment().endOf("year").unix();
}

export const getTimezoneMindifference = (timezone = 'America/Denver') => {
  var now = moment();
  var localOffset = now.utcOffset();
  now.tz(timezone);
  var centralOffset = now.utcOffset();
  return localOffset - centralOffset;
}

export const changeTimeZone = (date, timezone) => {
  if (!timezone) {
    timezone = getLocalTz()
  }
  return moment(date).tz(timezone, true).unix()
};
export const changeTimeZoneWithDate = (date: number | undefined, timezone) => {
  if (!timezone) {
    timezone = getLocalTz()
  }
  return moment(date).tz(timezone).unix()
};

export const formatWithoutTz = (millis, format = "YYYY-MM-DD HH:mm:ss a") => {
  return moment(millis).format(format);
};

export const formatWithTz = (millis, timezone, format = "MM/DD/YYYY hh:mm A") => {
  if (!timezone) {
    timezone = getLocalTz()
  }
  return moment(millis).tz(timezone).format(format);
}
// export const formatWithTz = (millis, timezone, format = "YYYY-MM-DD hh:mm:ss a") => {
//   if (!timezone) {
//     timezone = getLocalTz()
//   }
//   return moment(millis).tz(timezone).format(format);
// }

export const getLocalTz = () => {
  return moment.tz.guess();
}

export const convertToDate = (millis) => {
  return moment(millis * 1000).toDate();
}

export const convertToLocal = (timestamp, timezone) => {
  const formatConverted = timestamp && formatWithTz(timestamp * 1000, timezone)  
  const changedTzToActual = formatConverted && changeTimeZone(formatConverted, getLocalTz())
  return changedTzToActual
}