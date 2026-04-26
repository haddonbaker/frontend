const dayMap = { MONDAY: 'M', TUESDAY: 'T', WEDNESDAY: 'W', THURSDAY: 'R', FRIDAY: 'F', SATURDAY: 'S', SUNDAY: 'U' };
const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

/** Stable identity key for a course — used to detect duplicates and toggle favorites. */
export function courseKey(course) {
  return `${course.department}-${course.code}-${course.section}`;
}

export function formatTime(hour, minute) {
  if (hour == null || minute == null) return '';
  const h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  const displayMinutes = m < 10 ? `0${m}` : m;
  return `${displayHour}:${displayMinutes} ${ampm}`;
}

export function formatMeetingTimes(times) {
  if (!times || times.length === 0) return 'TBA';

  const timeGroups = new Map();

  times.forEach(time => {
    const startMins = time.hour * 60 + time.minute;
    const endMins = startMins + (time.minutesLong || 0);
    const endHour = Math.floor(endMins / 60) % 24;
    const endMinute = endMins % 60;
    const rangeStr = `${formatTime(time.hour, time.minute)} - ${formatTime(endHour, endMinute)}`;

    if (!timeGroups.has(rangeStr)) timeGroups.set(rangeStr, []);

    const day = typeof time.day === 'string' ? time.day.toUpperCase() : '';
    if (dayOrder.includes(day)) timeGroups.get(rangeStr).push(day);
  });

  for (const days of timeGroups.values()) {
    days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  }

  return [...timeGroups.entries()]
    .sort((a, b) => (a[1][0] ? dayOrder.indexOf(a[1][0]) : 0) - (b[1][0] ? dayOrder.indexOf(b[1][0]) : 0))
    .map(([range, days]) => `${days.map(d => dayMap[d] || '?').join('')} ${range}`)
    .join(', ');
}
