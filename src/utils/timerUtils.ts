/**
 * Timer, sprint math, streak logic, and report formatting
 */

export interface SessionRecord {
  id: string;
  timestamp: number;
  durationMinutes: number;
  taskTitle?: string;
  type: 'focus' | 'short_break' | 'long_break';
}

/**
 * Format total seconds into MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    const hh = hrs.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

/**
 * Format minutes into human readable text e.g. "2 hrs 15 mins" or "45 mins"
 */
export function formatDurationHuman(minutes: number): string {
  if (minutes <= 0) return '0 mins';
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;

  if (hrs > 0 && remMins > 0) {
    return `${hrs}h ${remMins}m`;
  }
  if (hrs > 0) {
    return `${hrs}h`;
  }
  return `${remMins}m`;
}

/**
 * Calculate consecutive daily focus streak from session history
 */
export function calculateStreak(sessions: SessionRecord[]): number {
  if (!sessions || sessions.length === 0) return 0;

  // Filter only focus sessions
  const focusSessions = sessions.filter(s => s.type === 'focus');
  if (focusSessions.length === 0) return 0;

  // Group by date strings YYYY-MM-DD in local time
  const daysSet = new Set<string>();
  for (const s of focusSessions) {
    const d = new Date(s.timestamp);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    daysSet.add(dateStr);
  }

  const sortedDays = Array.from(daysSet).sort().reverse();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // Check if user has focused today or yesterday to maintain streak
  if (!sortedDays.includes(todayStr) && !sortedDays.includes(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let checkDate = sortedDays.includes(todayStr) ? new Date(today) : new Date(yesterday);

  while (true) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (daysSet.has(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate total focus minutes logged for today
 */
export function calculateTodayFocusMinutes(sessions: SessionRecord[]): number {
  if (!sessions || sessions.length === 0) return 0;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  return sessions
    .filter(s => s.type === 'focus' && s.timestamp >= todayStart && s.timestamp < todayEnd)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

/**
 * Generate a formatted Markdown export of the deep work session
 */
export function generateSessionMarkdownReport(
  totalMinutes: number,
  completedTasks: string[],
  streak: number
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const taskList = completedTasks.length > 0
    ? completedTasks.map(t => `- [x] ${t}`).join('\n')
    : '- No completed tasks recorded today';

  return `# NeuroFlow — Daily Focus Report
**Date**: ${dateStr}
**Total Deep Work Logged**: ${formatDurationHuman(totalMinutes)}
**Current Focus Streak**: ${streak} day${streak === 1 ? '' : 's'}

### Completed Tasks
${taskList}

---
*Built for Vibe Forge by Saad*`;
}
