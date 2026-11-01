import { Goal, Roadmap, Lesson, Quiz, DocumentItem, Flashcard } from "../types";

export function generateRoadmapForGoal(goal: Goal, version = 1): Roadmap {
  const goalTitle = goal.title;
  const level = goal.current_level;
  const dailyMin = goal.daily_minutes;

  // Compute realistic modules and topics based on the goal title
  const totalDays = Math.max(10, Math.min(60, Math.round(900 / dailyMin)));
  const totalHours = Math.round((totalDays * dailyMin) / 60);

  const modules = [
    {
      id: `mod-${Date.now()}-1`,
      title: `Module 1: Foundations & Core Concepts of ${goalTitle.split(" ")[0] || "Topic"}`,
      description: `Essential mental models, basic syntax, and architectural building blocks for ${level} level.`,
      order: 1,
      topics: [
        {
          id: `top-${Date.now()}-1`,
          module_id: `mod-${Date.now()}-1`,
          title: `Core Principles & Fundamental Primitives`,
          description: `Overview of the core mechanisms and initial setup requirements.`,
          estimated_minutes: dailyMin,
          day_number: 1,
          kind: "core" as const,
          practice_task: `Complete hands-on exercise initializing the environment and writing a foundational script.`,
          status: "not_started" as const,
          mastery_score: null,
        },
        {
          id: `top-${Date.now()}-2`,
          module_id: `mod-${Date.now()}-1`,
          title: `State Management, Lifecycle & Execution Flow`,
          description: `How operations are scheduled, lifecycle events, and state mutations.`,
          estimated_minutes: dailyMin,
          day_number: 2,
          kind: "core" as const,
          practice_task: `Trace and log the complete execution lifecycle with sample inputs.`,
          status: "not_started" as const,
          mastery_score: null,
        },
        {
          id: `top-${Date.now()}-3`,
          module_id: `mod-${Date.now()}-1`,
          title: `Handling Errors, Edge Cases & Guardrails`,
          description: `Defensive patterns, timeout strategies, and fallback mechanisms.`,
          estimated_minutes: Math.round(dailyMin * 0.9),
          day_number: 3,
          kind: "core" as const,
          practice_task: `Build a test suite asserting failure recovery under synthetic network interruptions.`,
          status: "not_started" as const,
          mastery_score: null,
        },
      ],
    },
    {
      id: `mod-${Date.now()}-2`,
      title: `Module 2: Intermediate Implementation & Workflows`,
      description: `Connecting multiple subsystems and orchestrating practical pipelines.`,
      order: 2,
      topics: [
        {
          id: `top-${Date.now()}-4`,
          module_id: `mod-${Date.now()}-2`,
          title: `Pipeline Integration & Configuration`,
          description: `Best practices for declarative configuration, environment parameters, and modularity.`,
          estimated_minutes: dailyMin,
          day_number: 4,
          kind: "core" as const,
          practice_task: `Refactor hardcoded values into externalized configuration manifests.`,
          status: "not_started" as const,
          mastery_score: null,
        },
        {
          id: `top-${Date.now()}-5`,
          module_id: `mod-${Date.now()}-2`,
          title: `Performance Optimization & Caching`,
          description: `Identifying bottlenecks, profiling latency, and introducing caching strategies.`,
          estimated_minutes: dailyMin,
          day_number: 5,
          kind: "core" as const,
          practice_task: `Profile baseline latency and reduce execution time by 30% using localized caching.`,
          status: "not_started" as const,
          mastery_score: null,
        },
        {
          id: `top-${Date.now()}-6`,
          module_id: `mod-${Date.now()}-2`,
          title: `Supplementary Deep Dive: Tooling & Utilities`,
          description: `Advanced debugging utilities and CLI tools recommended by domain practitioners.`,
          estimated_minutes: Math.round(dailyMin * 0.8),
          day_number: 6,
          kind: "enrichment" as const,
          practice_task: `Explore CLI flags and configure an automated linter in your repository.`,
          status: "not_started" as const,
          mastery_score: null,
        },
      ],
    },
    {
      id: `mod-${Date.now()}-3`,
      title: `Module 3: Advanced Architecture & Production Readiness`,
      description: `Scaling, security enforcement, monitoring, and comprehensive review.`,
      order: 3,
      topics: [
        {
          id: `top-${Date.now()}-7`,
          module_id: `mod-${Date.now()}-3`,
          title: `Security Hardening & Access Control`,
          description: `Zero-trust identity, credential rotation, and attack vector mitigation.`,
          estimated_minutes: dailyMin,
          day_number: 7,
          kind: "core" as const,
          practice_task: `Audit access permissions and enforce principle of least privilege.`,
          status: "not_started" as const,
          mastery_score: null,
        },
        {
          id: `top-${Date.now()}-8`,
          module_id: `mod-${Date.now()}-3`,
          title: `Capstone Comprehensive Review & Mock Assessment`,
          description: `Consolidating learnings across all modules with real-world scenarios.`,
          estimated_minutes: dailyMin + 15,
          day_number: 8,
          kind: "revision" as const,
          practice_task: `Solve an unguided end-to-end challenge combining all concepts learned.`,
          status: "not_started" as const,
          mastery_score: null,
        },
      ],
    },
  ];

  return {
    id: `roadmap-${goal.id}-v${version}`,
    goal_id: goal.id,
    version,
    status: "current",
    title: `Curriculum: ${goal.title}`,
    description: `Targeted study roadmap optimized for ${goal.daily_minutes} minutes/day study pace.`,
    total_estimated_hours: totalHours,
    created_at: new Date().toISOString(),
    modules,
  };
}

export function generateLessonForTopic(
  topicId: string,
  topicTitle: string,
  goalId: string,
  version: "standard" | "simpler" | "deep_dive" = "standard"
): Lesson {
  return {
    id: `lesson-${topicId}-${version}`,
    topic_id: topicId,
    goal_id: goalId,
    version,
    title: `${topicTitle} (${version === "simpler" ? "Simplified Guide" : version === "deep_dive" ? "Deep Architecture" : "Core Lesson"})`,
    overview: `This lesson covers ${topicTitle}. You will understand the underlying principles, how to write practical implementations, common production pitfalls, and clear step-by-step examples.`,
    objectives: [
      `Understand the primary problem solved by ${topicTitle}.`,
      `Learn the core vocabulary, properties, and configuration parameters.`,
      `Follow a step-by-step worked scenario demonstrating implementation.`,
      `Recognize and prevent top 3 common failure modes.`,
    ],
    sections: [
      {
        id: "s1",
        title: "1. Core Concept & Context",
        content: `${topicTitle} is a foundational requirement in modern architectures. When building scalable software, isolating responsibilities into declarative units reduces operational drag and eliminates single points of failure.\n\nKey advantages include predictable behavior, automated recovery, and clean separation between application business logic and infrastructure concerns.`,
        callout: {
          type: "note",
          message: "Keep concepts modular. Start with defaults before introducing custom tuning flags.",
        },
      },
      {
        id: "s2",
        title: "2. Technical Implementation & Flow",
        content: `To implement this effectively, we define structured definitions. Review the example specification below:\n\n1. Declare resource limits and explicit dependencies.\n2. Ensure health checks and probe thresholds match realistic startup times.\n3. Validate logs and metrics immediately after deployment.`,
        codeSnippet: {
          language: "json",
          code: `{\n  "name": "service-worker",\n  "enabled": true,\n  "concurrency": 4,\n  "retry_policy": {\n    "max_attempts": 3,\n    "backoff_factor": 2\n  },\n  "health_check": {\n    "endpoint": "/status",\n    "interval_seconds": 15\n  }\n}`,
        },
      },
      {
        id: "s3",
        title: "3. Best Practices in Production",
        content: `Always measure baseline latency before applying changes. Ensure that transient network spikes do not trigger cascading restarts across your infrastructure.`,
        callout: {
          type: "tip",
          message: "Use exponential backoff with random jitter to avoid thundering herd problems during outages.",
        },
      },
    ],
    key_terms: [
      {
        term: "Idempotency",
        definition: "The property where performing an operation multiple times produces the exact same outcome as running it once.",
      },
      {
        term: "Backpressure",
        definition: "A mechanism that throttles incoming requests when the downstream consumer is near maximum capacity.",
      },
      {
        term: "Circuit Breaker",
        definition: "A design pattern that temporarily trips open and halts calls to a failing remote dependency to prevent cascading system collapse.",
      },
    ],
    worked_example: {
      title: "Step-by-Step Practical Walkthrough",
      problem: `How to implement reliable processing for ${topicTitle} without risking service downtime.`,
      steps: [
        {
          step_number: 1,
          instruction: "Define clear preconditions and schema validation.",
          explanation: "Reject malformed inputs at the boundary before passing them to internal processing queues.",
        },
        {
          step_number: 2,
          instruction: "Attach structured logging with correlated trace IDs.",
          explanation: "Allows instantaneous tracing of any failed request across all microservices.",
        },
        {
          step_number: 3,
          instruction: "Verify through automated integration tests.",
          explanation: "Simulate network timeouts and verify the retry queue processes the message properly.",
        },
      ],
      takeaway: "Robust systems are built by designing for failure from day one.",
    },
    common_mistakes: [
      {
        mistake: "Unbounded retries without exponential backoff.",
        why: "Overwhelms struggling servers with millions of redundant requests.",
        solution: "Cap retries at 3 attempts and add exponential jitter.",
      },
      {
        mistake: "Ignoring timeout boundaries.",
        why: "Hangs server worker threads indefinitely waiting for unresponsive upstream APIs.",
        solution: "Enforce strict HTTP connect and read timeouts (e.g. 5000ms).",
      },
    ],
    summary: `You now know the vital mechanics of ${topicTitle}. You can proceed with the knowledge check quiz to measure your understanding.`,
    simple_explanation: `Imagine sending letters by mail. If the post office is temporarily closed for lunch, you don't instantly throw away your letter or send 100 copies in one minute. You wait 15 minutes, try again calmly, and only if it's closed for days do you notify the sender. That's the essence of resilient software design!`,
    created_at: new Date().toISOString(),
  };
}

export function generateQuizForTopic(
  topicId: string,
  topicTitle: string,
  goalId: string,
  purpose: "check" | "practice" = "check"
): Quiz {
  return {
    id: `quiz-${topicId}-${Date.now()}`,
    topic_id: topicId,
    topic_title: topicTitle,
    goal_id: goalId,
    title: `${purpose === "practice" ? "Practice Quiz" : "Mastery Assessment"}: ${topicTitle}`,
    purpose,
    questions: [
      {
        id: `q-${topicId}-1`,
        question: `What is the primary advantage of idempotency when working with ${topicTitle}?`,
        options: [
          "It accelerates CPU clock frequencies during computation.",
          "It guarantees that repeating a request does not cause unintended duplicate side effects.",
          "It eliminates the need for any unit tests or integration verification.",
          "It forces all network connections to use plaintext HTTP.",
        ],
        correct_option_index: 1,
        explanation: "Idempotency ensures safe retries: executing the action multiple times yields identical state changes without duplicating operations.",
        concept: "Idempotency & Safe Retries",
      },
      {
        id: `q-${topicId}-2`,
        question: `When handling transient service errors, why is exponential backoff with jitter recommended?`,
        options: [
          "It guarantees 100% zero latency for all incoming clients.",
          "It randomizes and spreads retry attempts to prevent thundering herd spikes.",
          "It compresses the database indexes automatically.",
          "It disables authorization checks during high traffic.",
        ],
        correct_option_index: 1,
        explanation: "Adding random jitter spreads out concurrent retries across time, stopping hundreds of clients from hammering a recovering system at the exact same second.",
        concept: "Exponential Backoff & Jitter",
      },
      {
        id: `q-${topicId}-3`,
        question: `Which indicator is most critical for detecting memory leakage before process failure?`,
        options: [
          "Gradually climbing resident set size (RSS) that never drops after garbage collection cycles.",
          "The file extension of the configuration YAML file.",
          "The number of comments in the application repository.",
          "CSS stylesheet bundle size on initial load.",
        ],
        correct_option_index: 0,
        explanation: "Steadily rising RSS memory that fails to reclaim after full garbage collection sweeps strongly signals unreleased pointers or dangling listener references.",
        concept: "Resource Monitoring & Leak Detection",
      },
    ],
    attempt: null,
  };
}

export function generateFlashcardsFromTopic(
  goalId: string,
  topicTitle: string
): Flashcard[] {
  return [
    {
      id: `fc-${Date.now()}-1`,
      goal_id: goalId,
      front: `What is the core principle behind ${topicTitle}?`,
      back: `It provides structured, resilient separation of concerns with predictable execution and explicit failure handling.`,
      stage: "learning",
      repetition_count: 0,
      interval_days: 1,
      due_at: new Date().toISOString(),
      last_reviewed_at: null,
    },
    {
      id: `fc-${Date.now()}-2`,
      goal_id: goalId,
      front: `What is a common pitfall when configuring ${topicTitle}?`,
      back: `Failing to configure proper timeouts or retrying aggressively without exponential backoff, which leads to thundering herd outages.`,
      stage: "learning",
      repetition_count: 0,
      interval_days: 1,
      due_at: new Date().toISOString(),
      last_reviewed_at: null,
    },
  ];
}
