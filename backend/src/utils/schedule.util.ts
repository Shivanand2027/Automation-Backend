/**
 * Schedule utility functions for handling time conversions and cron expressions
 */

export interface TimeConfig {
  hour: number;
  minute: number;
  timezone: string;
}

/**
 * Convert time string (HH:MM) to hour and minute
 */
export const parseTime = (timeString: string): { hour: number; minute: number } => {
  const [hourStr, minuteStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('Invalid time format. Use HH:MM (24-hour format)');
  }

  return { hour, minute };
};

/**
 * Generate cron expression for daily execution at specified time
 * @param timeString Format: "HH:MM" in 24-hour format
 * @returns Cron expression string
 */
export const generateDailyCronExpression = (timeString: string): string => {
  const { hour, minute } = parseTime(timeString);
  return `${minute} ${hour} * * *`;
};

/**
 * Validate timezone string
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    // Try to create a formatter with the timezone
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Convert user's local time to UTC for cron scheduling
 */
export const convertToUTCTime = (localTime: string, timezone: string): string => {
  const { hour, minute } = parseTime(localTime);
  
  // Create a date object in the specified timezone
  const now = new Date();
  const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  
  const dateInTimezone = new Date(`${dateString}T${timeString}`);
  
  // Get offset in minutes for the timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  // Parse the offset
  const parts = formatter.format(dateInTimezone);
  
  // Calculate UTC time
  const date = new Date(dateInTimezone.toLocaleString('en-US', { timeZone: timezone }));
  const utcDate = new Date(date.toISOString());
  
  const utcHour = utcDate.getUTCHours();
  const utcMinute = utcDate.getUTCMinutes();
  
  return `${String(utcHour).padStart(2, '0')}:${String(utcMinute).padStart(2, '0')}`;
};

/**
 * Get next scheduled run time for a repository
 */
export const getNextScheduledRun = (scheduledTime: string, timezone: string): Date => {
  const { hour, minute } = parseTime(scheduledTime);
  
  const now = new Date();
  const todayInTimezone = new Date(
    now.toLocaleString('en-US', { timeZone: timezone })
  );
  
  const scheduled = new Date(todayInTimezone);
  scheduled.setHours(hour, minute, 0, 0);
  
  // If the time has passed today, schedule for tomorrow
  if (scheduled <= todayInTimezone) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  
  return scheduled;
};

/**
 * Common timezone list for UI
 */
export const commonTimezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
  { value: 'Asia/Shanghai', label: 'Beijing/Shanghai' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];
