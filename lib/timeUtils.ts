// Utility functions for time formatting

/**
 * Format decimal hours to "Xh Ym" format
 * @param decimalHours - Hours as decimal (e.g., 7.5)
 * @returns Formatted string (e.g., "7h 30m" or "7h" if no minutes)
 */
export function formatSleepTime(decimalHours: number): string {
  if (decimalHours === 0) return '0h';
  
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Format decimal hours for display in buttons and dialogs
 * @param decimalHours - Hours as decimal
 * @returns Formatted string with "today" suffix for context
 */
export function formatSleepDisplay(decimalHours: number): string {
  if (decimalHours === 0) return '0h today';
  return `${formatSleepTime(decimalHours)} today`;
}

/**
 * Format sleep time for dialog display
 * @param decimalHours - Hours as decimal
 * @returns Formatted string for dialogs and alerts
 */
export function formatSleepDialog(decimalHours: number): string {
  if (decimalHours === 0) return '0h';
  return formatSleepTime(decimalHours);
}

/**
 * Format exercise time from minutes to hours and minutes
 * @param totalMinutes - Total minutes of exercise
 * @returns Formatted string (e.g., "1h 30m" or "45m")
 */
export function formatExerciseTime(totalMinutes: number): string {
  if (totalMinutes === 0) return '0m';
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Format study time from minutes to hours and minutes
 * @param totalMinutes - Total minutes of study
 * @returns Formatted string (e.g., "2h 15m" or "45m")
 */
export function formatStudyTime(totalMinutes: number): string {
  return formatExerciseTime(totalMinutes); // Same logic
}
/**
 * Format sleep session duration for detailed display
 * @param durationHours - Duration in hours (decimal)
 * @param durationMinutes - Duration in minutes (optional, calculated if not provided)
 * @returns Formatted string with both hours and minutes clearly shown
 */
export function formatSleepSession(durationHours: number, durationMinutes?: number): string {
  const minutes = durationMinutes || Math.round(durationHours * 60);
  
  if (minutes === 0) return '0 minutes';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  }
}

/**
 * Format sleep session for compact display (stats, lists)
 * @param durationHours - Duration in hours (decimal)
 * @param durationMinutes - Duration in minutes (optional)
 * @returns Compact formatted string (e.g., "7h 30m", "45m")
 */
export function formatSleepSessionCompact(durationHours: number, durationMinutes?: number): string {
  const minutes = durationMinutes || Math.round(durationHours * 60);
  
  if (minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}