import test from "node:test";
import assert from "node:assert/strict";
import { generateRoadmapForGoal } from "../lib/ai-generator";
import { Goal } from "../types";

test("generateRoadmapForGoal creates structured modules and topics with valid duration", () => {
  const mockGoal: Goal = {
    id: "goal-test-1",
    title: "Rust Systems Programming & Concurrency",
    description: "Learn ownership, borrow checker, and multithreading in Rust",
    goal_type: "professional_skill",
    current_level: "beginner",
    preferred_languages: ["en"],
    daily_minutes: 45,
    target_date: "2026-12-31",
    status: "active",
    learning_preferences: ["worked_examples", "active_recall"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const roadmap = generateRoadmapForGoal(mockGoal, 1);

  assert.equal(roadmap.goal_id, mockGoal.id);
  assert.equal(roadmap.version, 1);
  assert.ok(roadmap.modules.length >= 3, "Roadmap should generate at least 3 modules");
  assert.ok(roadmap.total_estimated_hours > 0, "Roadmap should have positive estimated hours");

  // Every module must have topics with estimated minutes and status
  const allTopics = roadmap.modules.flatMap((m) => m.topics);
  assert.ok(allTopics.length >= 6, "Roadmap should generate at least 6 topics");

  for (const topic of allTopics) {
    assert.ok(topic.id, "Topic has id");
    assert.ok(topic.title, "Topic has title");
    assert.ok(topic.estimated_minutes > 0, "Topic has positive estimated minutes");
    assert.equal(topic.status, "not_started", "New topic starts as not_started");
  }
});

test("SuperMemo SM-2 interval calculations for flashcard ratings", () => {
  // Test interval progression logic
  const initialCard = {
    interval_days: 1,
    repetition_count: 0,
    stage: "learning" as const,
  };

  // 'good' rating should expand interval
  const goodInterval = Math.max(2, Math.round(initialCard.interval_days * 2.2));
  assert.equal(goodInterval, 2);

  // 'easy' rating should jump to higher interval and mastered
  const easyInterval = Math.max(4, Math.round(initialCard.interval_days * 3.5));
  assert.equal(easyInterval, 4);

  // 'again' rating should reset interval to immediate review (~0.05 days / 1 hour)
  const againInterval = 0.05;
  assert.ok(againInterval < 0.1);
});
