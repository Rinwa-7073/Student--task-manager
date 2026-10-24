/**
 * Formatting and progress utilities for task focus time and study sessions.
 */

/**
 * Formats a count of minutes into a concise human-readable duration (e.g., "45m", "1h 30m").
 */
export function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0 || isNaN(minutes)) {
    return '0m';
  }

  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remainingMins = rounded % 60;

  if (hours === 0) {
    return `${remainingMins}m`;
  }

  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

/**
 * Formats total seconds into a digital timer display "MM:SS" (e.g., 1500s -> "25:00").
 */
export function formatSeconds(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0 || isNaN(totalSeconds)) {
    return '00:00';
  }

  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  return `${paddedMins}:${paddedSecs}`;
}

export interface FocusProgressResult {
  percentage: number;
  isOver: boolean;
  formattedLogged: string;
  formattedEstimated: string | null;
}

/**
 * Computes the percentage of estimated study time completed by logged focus time.
 */
export function calculateFocusProgress(
  loggedMinutes: number | null | undefined,
  estimatedMinutes: number | null | undefined,
): FocusProgressResult {
  const logged = Math.max(0, loggedMinutes ?? 0);
  const formattedLogged = formatMinutes(logged);

  if (!estimatedMinutes || estimatedMinutes <= 0) {
    return {
      percentage: 0,
      isOver: false,
      formattedLogged,
      formattedEstimated: null,
    };
  }

  const estimated = estimatedMinutes;
  const rawPercentage = (logged / estimated) * 100;
  const percentage = Math.min(100, Math.round(rawPercentage));
  const isOver = logged > estimated;

  return {
    percentage,
    isOver,
    formattedLogged,
    formattedEstimated: formatMinutes(estimated),
  };
}
