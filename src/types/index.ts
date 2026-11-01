export type GoalType =
  | "exam"
  | "certification"
  | "career_pivot"
  | "hobby"
  | "professional_skill"
  | "general";

export type GoalLevel = "beginner" | "intermediate" | "advanced" | "unknown";

export type GoalStatus = "active" | "paused" | "completed" | "archived";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  current_level: GoalLevel;
  status: GoalStatus;
  target_date: string | null;
  daily_minutes: number;
  preferred_languages: string[];
  learning_preferences: string[];
  created_at: string;
  updated_at: string;
}

export interface RoadmapTopic {
  id: string;
  module_id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  day_number: number | null;
  kind: "core" | "enrichment" | "revision";
  practice_task: string | null;
  status: "not_started" | "in_progress" | "completed";
  mastery_score?: number | null;
  reading_time_seconds?: number | null;
  completed_at?: string | null;
}

export interface RoadmapModule {
  id: string;
  title: string;
  description: string;
  order: number;
  topics: RoadmapTopic[];
}

export interface Roadmap {
  id: string;
  goal_id: string;
  version: number;
  status: "current" | "superseded" | "draft";
  title: string;
  description: string;
  total_estimated_hours: number;
  created_at: string;
  modules: RoadmapModule[];
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  callout?: {
    type: "tip" | "warning" | "note";
    message: string;
  };
  completed?: boolean;
}

export interface Lesson {
  id: string;
  topic_id: string;
  goal_id: string;
  version: "standard" | "simpler" | "deep_dive";
  title: string;
  overview: string;
  objectives: string[];
  sections: LessonSection[];
  key_terms: { term: string; definition: string }[];
  worked_example: {
    title: string;
    problem: string;
    steps: { step_number: number; instruction: string; explanation: string }[];
    takeaway: string;
  };
  common_mistakes: { mistake: string; why: string; solution: string }[];
  summary: string;
  simple_explanation: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  concept: string;
}

export interface QuizAttemptAnswer {
  question_id: string;
  selected_option_index: number;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  topic_id: string;
  goal_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  answers: QuizAttemptAnswer[];
  weak_concepts: string[];
  next_step_recommendation: string;
  submitted_at: string;
}

export interface Quiz {
  id: string;
  topic_id: string;
  topic_title: string;
  goal_id: string;
  title: string;
  purpose: "check" | "practice";
  is_synthetic?: boolean;
  questions: QuizQuestion[];
  attempt?: QuizAttempt | null;
}

export interface DocumentPassage {
  id: string;
  page_number: number;
  content: string;
}

export interface DocumentItem {
  id: string;
  goal_id: string;
  title: string;
  original_name?: string;
  kind: "pdf" | "notes" | "paste" | "text";
  size_bytes: number;
  chunk_count: number;
  status: "ready" | "processing" | "failed" | "review";
  created_at: string;
  passages: DocumentPassage[];
}

export interface Flashcard {
  id: string;
  goal_id: string;
  front: string;
  back: string;
  stage: "learning" | "review" | "mastered";
  repetition_count: number;
  interval_days: number;
  due_at: string;
  last_reviewed_at: string | null;
}

export interface ExportItem {
  id: string;
  goal_id: string;
  kind: "lesson" | "roadmap" | "flashcards" | "quiz_summary" | "presentation" | "cheatsheet";
  title: string;
  format: "pdf" | "markdown" | "pptx";
  size_kb: number;
  created_at: string;
  status: "ready" | "processing";
}

export interface LearningResource {
  id: string;
  topic_id?: string;
  goal_id: string;
  title: string;
  channel: string;
  youtube_id: string;
  url: string;
  thumbnail_url: string;
  duration: string;
  language: "en" | "hi" | "or";
  relevance_score: number;
  description?: string;
}

export interface UserPreferences {
  default_daily_minutes: number;
  preferred_languages: string[];
  learning_preferences: string[];
}

export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  photo_url?: string;
  bio?: string;
  target_role?: string;
  weekly_goal_hours?: number;
  timezone: string;
  onboarding_completed: boolean;
  role?: "student" | "admin";
  preferences: UserPreferences;
  created_at?: string;
  updated_at?: string;
}

export interface SessionDurationMetric {
  id: string;
  user_id: string;
  goal_id: string;
  item_id: string;
  topic_id: string;
  topic_title?: string;
  metric_name: "session_duration";
  session_duration: number;
  duration_seconds: number;
  exit_reason: "navigate_away" | "window_close" | "completed" | "manual_log";
  started_at: string;
  ended_at: string;
  logged_at: string;
  synced_to_db?: boolean;
}


