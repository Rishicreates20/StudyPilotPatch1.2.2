import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatDuration,
  formatClockTime,
  calculateElapsedSessionSeconds,
  buildSessionDurationPayload,
} from "../views/LessonView";

test("formatClockTime formats seconds to mm:ss correctly", () => {
  assert.equal(formatClockTime(0), "00:00");
  assert.equal(formatClockTime(9), "00:09");
  assert.equal(formatClockTime(65), "01:05");
  assert.equal(formatClockTime(600), "10:00");
  assert.equal(formatClockTime(3665), "61:05");
});

test("formatDuration formats seconds into human readable strings", () => {
  assert.equal(formatDuration(45), "45s");
  assert.equal(formatDuration(125), "2m 5s");
  assert.equal(formatDuration(3600), "1h 0m 0s");
  assert.equal(formatDuration(3725), "1h 2m 5s");
});

test("calculateElapsedSessionSeconds computes active elapsed seconds excluding paused time", () => {
  const startMs = 1_700_000_000_000;
  const endMs = startMs + 42_000; // 42 seconds later
  assert.equal(calculateElapsedSessionSeconds(startMs, endMs, 0), 42);
  assert.equal(calculateElapsedSessionSeconds(startMs, endMs, 12_000), 30);
  // Clamps to 0 if paused time exceeds elapsed or end < start
  assert.equal(calculateElapsedSessionSeconds(startMs, startMs - 1000, 0), 0);
  assert.equal(calculateElapsedSessionSeconds(startMs, endMs, 60_000), 0);
});

test("buildSessionDurationPayload constructs valid session_duration database metric record", () => {
  const payload = buildSessionDurationPayload({
    id: "sdm-test-1",
    userId: "user-123",
    goalId: "goal-k8s-101",
    topicId: "top-1-1",
    topicTitle: "Pod Lifecycle, Init Containers & Liveness Probes",
    sessionDurationSeconds: 185,
    startedAt: "2026-11-01T14:00:00.000Z",
    endedAt: "2026-11-01T14:03:05.000Z",
    exitReason: "navigate_away",
    syncedToDb: true,
  });

  assert.equal(payload.id, "sdm-test-1");
  assert.equal(payload.metric_name, "session_duration");
  assert.equal(payload.session_duration, 185);
  assert.equal(payload.duration_seconds, 185);
  assert.equal(payload.exit_reason, "navigate_away");
  assert.equal(payload.goal_id, "goal-k8s-101");
  assert.equal(payload.topic_id, "top-1-1");
  assert.equal(payload.synced_to_db, true);
});

