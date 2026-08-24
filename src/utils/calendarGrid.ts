/**
 * Generates a 2D matrix of days for any month and year.
 * Each sub-array represents a week (Sunday to Saturday).
 * Empty slots before the 1st and after the last day of the month are filled with `null`.
 *
 * @param year e.g. 2026
 * @param month 0-indexed month (0 = Jan, 1 = Feb, ..., 6 = Jul, 7 = Aug, ..., 11 = Dec)
 * @returns (number | null)[][]
 */
export function getMonthGrid(year: number, month: number): (number | null)[][] {
  // First day of the month
  const firstDayDate = new Date(year, month, 1);
  const firstWeekday = firstDayDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Total days in this month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  // Pad the first week with nulls for days before the 1st
  for (let i = 0; i < firstWeekday; i++) {
    currentWeek.push(null);
  }

  // Fill in all the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);

    // If we reached Saturday (7 days in week), push to weeks and start new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad the remaining slots of the last week with nulls if needed
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Returns formatted month title string, e.g. "August 2026"
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Formats a specific day into YYYY-MM-DD date key
 */
export function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}
