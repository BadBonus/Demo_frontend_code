export type TTimezone_custom = {
  // name: string;
  offset: string;
  // longName: string;
  label: string;
};

export const ALL_TIMEZONES = Intl.supportedValuesOf('timeZone');
export type TTimezone = (typeof ALL_TIMEZONES)[number];

export const popularTimezones: TTimezone_custom[] = [
  {
    label: '(GMT-11:00) Coordinated Universal Time-11',
    // longName: "Coordinated Universal Time-11",
    // name: "Pacific/Pago_Pago",
    offset: 'UTC-11:00',
  },
  {
    label: '(GMT-10:00) Hawaii-Aleutian Standard Time',
    // longName: "Hawaii-Aleutian Standard Time",
    // name: "Pacific/Honolulu",
    offset: 'UTC-10:00',
  },
  {
    label: '(GMT-09:00) Alaska Standard Time',
    // longName: "Alaska Standard Time",
    // name: "America/Anchorage",
    offset: 'UTC-09:00',
  },
  {
    label: '(GMT-08:00) Pacific Standard Time',
    // longName: "Pacific Standard Time",
    // name: "America/Los_Angeles",
    offset: 'UTC-08:00',
  },
  {
    label: '(GMT-07:00) Mountain Standard Time',
    // longName: "Mountain Standard Time",
    // name: "America/Denver",
    offset: 'UTC-07:00',
  },
  {
    label: '(GMT-06:00) Central Standard Time',
    // longName: "Central Standard Time",
    // name: "America/Chicago",
    offset: 'UTC-06:00',
  },
  {
    label: '(GMT-05:00) Eastern Standard Time',
    // longName: "Eastern Standard Time",
    // name: "America/New_York",
    offset: 'UTC-05:00',
  },
  {
    label: '(GMT-04:00) Atlantic Standard Time',
    // longName: "Atlantic Standard Time",
    // name: "America/Halifax",
    offset: 'UTC-04:00',
  },
  {
    label: '(GMT-03:00) Brasilia Standard Time',
    // longName: "Brasilia Standard Time",
    // name: "America/Sao_Paulo",
    offset: 'UTC-03:00',
  },
  {
    label: '(GMT-02:00) South Georgia Standard Time',
    // longName: "South Georgia Standard Time",
    // name: "Atlantic/South_Georgia",
    offset: 'UTC-02:00',
  },
  {
    label: '(GMT-01:00) Cape Verde Standard Time',
    // longName: "Cape Verde Standard Time",
    // name: "Atlantic/Cape_Verde",
    offset: 'UTC-01:00',
  },
  {
    label: '(GMT+00:00) Greenwich Mean Time',
    // longName: "Greenwich Mean Time",
    // name: "Europe/London",
    offset: 'UTC+00:00',
  },
  {
    label: '(GMT+01:00) Central European Standard Time',
    // longName: "Central European Standard Time",
    // name: "Europe/Paris",
    offset: 'UTC+01:00',
  },
  {
    label: '(GMT+02:00) Eastern European Standard Time',
    // longName: "Eastern European Standard Time",
    // name: "Europe/Athens",
    offset: 'UTC+02:00',
  },
  {
    label: '(GMT+03:00) Moscow Standard Time',
    // longName: "Moscow Standard Time",
    // name: "Europe/Moscow",
    offset: 'UTC+03:00',
  },
  {
    label: '(GMT+04:00) Gulf Standard Time',
    // longName: "Gulf Standard Time",
    // name: "Asia/Dubai",
    offset: 'UTC+04:00',
  },
  {
    label: '(GMT+05:00) Pakistan Standard Time',
    // longName: "Pakistan Standard Time",
    // name: "Asia/Karachi",
    offset: 'UTC+05:00',
  },
  {
    label: '(GMT+05:30) India Standard Time',
    // longName: "India Standard Time",
    // name: "Asia/Kolkata",
    offset: 'UTC+05:30',
  },
  {
    label: '(GMT+06:00) Bangladesh Standard Time',
    // longName: "Bangladesh Standard Time",
    // name: "Asia/Dhaka",
    offset: 'UTC+06:00',
  },
  {
    label: '(GMT+07:00) Indochina Time',
    // longName: "Indochina Time",
    // name: "Asia/Bangkok",
    offset: 'UTC+07:00',
  },
  {
    label: '(GMT+08:00) China Standard Time',
    // longName: "China Standard Time",
    // name: "Asia/Shanghai",
    offset: 'UTC+08:00',
  },
  {
    label: '(GMT+09:00) Japan Standard Time',
    // longName: "Japan Standard Time",
    // name: "Asia/Tokyo",
    offset: 'UTC+09:00',
  },
  {
    label: '(GMT+10:00) Australian Eastern Standard Time',
    // longName: "Australian Eastern Standard Time",
    // name: "Australia/Sydney",
    offset: 'UTC+10:00',
  },
  {
    label: '(GMT+11:00) Solomon Islands Time',
    // longName: "Solomon Islands Time",
    // name: "Pacific/Guadalcanal",
    offset: 'UTC+11:00',
  },
  {
    label: '(GMT+12:00) New Zealand Standard Time',
    // longName: "New Zealand Standard Time",
    // name: "Pacific/Auckland",
    offset: 'UTC+12:00',
  },
];
