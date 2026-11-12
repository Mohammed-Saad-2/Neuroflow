import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  formatDurationHuman,
  calculateStreak,
  calculateTodayFocusMinutes,
  generateSessionMarkdownReport,
  SessionRecord,
} from './timerUtils.ts';

test('formatTime formats minutes and seconds correctly', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(1500), '25:00');
  assert.equal(formatTime(3665), '01:01:05');
});

test('formatDurationHuman formats readable text', () => {
  assert.equal(formatDurationHuman(0), '0 mins');
  assert.equal(formatDurationHuman(45), '45m');
  assert.equal(formatDurationHuman(120), '2h');
  assert.equal(formatDurationHuman(135), '2h 15m');
});

test('calculateStreak computes active consecutive days', () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const sessions: SessionRecord[] = [
    { id: '1', timestamp: now, durationMinutes: 25, type: 'focus' },
    { id: '2', timestamp: now - dayMs, durationMinutes: 25, type: 'focus' },
    { id: '3', timestamp: now - 2 * dayMs, durationMinutes: 50, type: 'focus' },
  ];

  const streak = calculateStreak(sessions);
  assert.ok(streak >= 2);
});

test('calculateStreak returns 0 for empty history', () => {
  assert.equal(calculateStreak([]), 0);
});

test('calculateTodayFocusMinutes sums only today focus records', () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const sessions: SessionRecord[] = [
    { id: '1', timestamp: now, durationMinutes: 25, type: 'focus' },
    { id: '2', timestamp: now, durationMinutes: 30, type: 'focus' },
    { id: '3', timestamp: now, durationMinutes: 5, type: 'short_break' },
    { id: '4', timestamp: now - 3 * dayMs, durationMinutes: 50, type: 'focus' },
  ];

  const todayMins = calculateTodayFocusMinutes(sessions);
  assert.equal(todayMins, 55);
});

test('generateSessionMarkdownReport generates valid markdown with footer credit', () => {
  const report = generateSessionMarkdownReport(75, ['Task A', 'Task B'], 3);
  assert.match(report, /NeuroFlow — Daily Focus Report/);
  assert.match(report, /1h 15m/);
  assert.match(report, /Task A/);
  assert.match(report, /Built for Vibe Forge by Saad/);
});
