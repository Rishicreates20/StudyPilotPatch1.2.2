import {
  Goal,
  Roadmap,
  RoadmapTopic,
  Lesson,
  Quiz,
  QuizAttempt,
  DocumentItem,
  Flashcard,
  ExportItem,
  UserProfile,
  LearningResource,
  SessionDurationMetric,
} from "../types";

const STORAGE_KEYS = {
  USER: "studypilot_user",
  GOALS: "studypilot_goals",
  ROADMAPS: "studypilot_roadmaps",
  LESSONS: "studypilot_lessons",
  QUIZZES: "studypilot_quizzes",
  ATTEMPTS: "studypilot_attempts",
  DOCUMENTS: "studypilot_documents",
  FLASHCARDS: "studypilot_flashcards",
  EXPORTS: "studypilot_exports",
  RESOURCES: "studypilot_resources",
  SESSION_METRICS: "studypilot_session_metrics",
  THEME: "studypilot_theme",
};

const DEFAULT_USER: UserProfile = {
  id: "user-default-1",
  display_name: "Rishikesh",
  email: "rishikeshsarangi122004@gmail.com",
  timezone: "UTC",
  onboarding_completed: true,
  preferences: {
    default_daily_minutes: 45,
    preferred_languages: ["en"],
    learning_preferences: ["worked_examples", "active_recall", "visual_diagrams"],
  },
};

const DEFAULT_GOALS: Goal[] = [
  {
    id: "goal-k8s-101",
    title: "Master Kubernetes & Cloud Architecture for Interviews",
    description: "Deep dive into production Kubernetes architectures, container networking, Helm charts, and cluster security for senior cloud engineering roles.",
    goal_type: "professional_skill",
    current_level: "intermediate",
    status: "active",
    target_date: "2026-12-15",
    daily_minutes: 45,
    preferred_languages: ["en"],
    learning_preferences: ["worked_examples", "practical_code"],
    created_at: "2026-10-15T09:00:00Z",
    updated_at: "2026-10-25T14:30:00Z",
  },
  {
    id: "goal-ml-202",
    title: "Deep Learning Foundations with PyTorch",
    description: "Build, train and optimize neural networks from scratch, understanding autograd, backprop, CNNs, and transformers.",
    goal_type: "career_pivot",
    current_level: "beginner",
    status: "active",
    target_date: "2027-01-30",
    daily_minutes: 60,
    preferred_languages: ["en"],
    learning_preferences: ["worked_examples"],
    created_at: "2026-10-20T11:00:00Z",
    updated_at: "2026-10-28T16:00:00Z",
  },
  {
    id: "goal-rust-303",
    title: "Rust Systems Programming & Memory Safety",
    description: "Understand ownership, borrowing, lifetimes, fearless concurrency, and async runtime implementations.",
    goal_type: "hobby",
    current_level: "beginner",
    status: "paused",
    target_date: "2027-03-01",
    daily_minutes: 30,
    preferred_languages: ["en"],
    learning_preferences: ["concise_notes"],
    created_at: "2026-09-01T08:00:00Z",
    updated_at: "2026-10-10T12:00:00Z",
  },
  {
    id: "goal-aws-404",
    title: "AWS Solutions Architect Associate SAA-C03",
    description: "Comprehensive exam preparation covering multi-tier architectures, VPC peering, RDS multi-AZ, and S3 lifecycle rules.",
    goal_type: "certification",
    current_level: "intermediate",
    status: "completed",
    target_date: "2026-10-01",
    daily_minutes: 45,
    preferred_languages: ["en"],
    learning_preferences: ["practice_quizzes"],
    created_at: "2026-08-15T10:00:00Z",
    updated_at: "2026-10-02T19:00:00Z",
  },
  {
    id: "goal-odia-505",
    title: "Odia Script Reading & Spoken Phrases",
    description: "Basic alphabets, common daily conversations, and colloquial idioms.",
    goal_type: "hobby",
    current_level: "beginner",
    status: "archived",
    target_date: null,
    daily_minutes: 20,
    preferred_languages: ["en"],
    learning_preferences: ["flashcards"],
    created_at: "2026-07-10T09:00:00Z",
    updated_at: "2026-08-01T10:00:00Z",
  },
];

const DEFAULT_ROADMAPS: Roadmap[] = [
  {
    id: "roadmap-k8s-v1",
    goal_id: "goal-k8s-101",
    version: 1,
    status: "current",
    title: "Production Kubernetes & Architecture Mastery",
    description: "A 4-week step-by-step curriculum structured for 45 minutes daily study.",
    total_estimated_hours: 21,
    created_at: "2026-10-15T09:30:00Z",
    modules: [
      {
        id: "mod-1",
        title: "Module 1: Pod Lifecycle & Workload Controllers",
        description: "Core primitives, scheduling, health probes, and declarative rollouts.",
        order: 1,
        topics: [
          {
            id: "top-1-1",
            module_id: "mod-1",
            title: "Pod Lifecycle, Init Containers & Liveness Probes",
            description: "Phase transitions, readiness vs liveness probes, restart policies, and pre-stop hooks.",
            estimated_minutes: 45,
            day_number: 1,
            kind: "core",
            practice_task: "Configure a Deployment manifest with startup, liveness, and readiness probes with initial delays.",
            status: "completed",
            mastery_score: 92,
          },
          {
            id: "top-1-2",
            module_id: "mod-1",
            title: "ReplicaSets, Deployments & Zero-Downtime Rollouts",
            description: "RollingUpdate strategies, maxSurge, maxUnavailable, rollbacks, and revision history limits.",
            estimated_minutes: 45,
            day_number: 2,
            kind: "core",
            practice_task: "Simulate a broken image deployment and perform an instant kubectl rollout undo.",
            status: "completed",
            mastery_score: 85,
          },
          {
            id: "top-1-3",
            module_id: "mod-1",
            title: "DaemonSets, StatefulSets & Headless Services",
            description: "Unique pod identities, stable network IDs, ordered graceful termination, and persistent storage bindings.",
            estimated_minutes: 50,
            day_number: 3,
            kind: "core",
            practice_task: "Deploy a 3-replica ZooKeeper or Redis cluster with stateful pod volume claim templates.",
            status: "in_progress",
            mastery_score: 70,
          },
        ],
      },
      {
        id: "mod-2",
        title: "Module 2: Networking, Ingress & Service Meshes",
        description: "ClusterIP, NodePort, LoadBalancer, Ingress controllers, and CNI overlay networks.",
        order: 2,
        topics: [
          {
            id: "top-2-1",
            module_id: "mod-2",
            title: "Kubernetes Service Primitives & CoreDNS Resolution",
            description: "How kube-proxy iptables/IPVS rules work, headless service DNS lookups, and endpoints slices.",
            estimated_minutes: 45,
            day_number: 4,
            kind: "core",
            practice_task: "Inspect iptables nat table rules created for a ClusterIP service using nsenter.",
            status: "in_progress",
            mastery_score: 65,
          },
          {
            id: "top-2-2",
            module_id: "mod-2",
            title: "Ingress Controllers, TLS Termination & Path Routing",
            description: "Configuring ingress-nginx, cert-manager automated Let's Encrypt TLS certs, and path rewrite annotations.",
            estimated_minutes: 50,
            day_number: 5,
            kind: "core",
            practice_task: "Author an Ingress resource with subpath routing and automatic TLS secret reference.",
            status: "not_started",
            mastery_score: null,
          },
          {
            id: "top-2-3",
            module_id: "mod-2",
            title: "Network Policies & Zero-Trust Isolation",
            description: "Default-deny egress/ingress, podSelector, namespaceSelector, and CIDR block rules.",
            estimated_minutes: 40,
            day_number: 6,
            kind: "enrichment",
            practice_task: "Implement a policy allowing traffic to backend pods strictly from the frontend namespace.",
            status: "not_started",
            mastery_score: null,
          },
        ],
      },
      {
        id: "mod-3",
        title: "Module 3: Storage, Configs & Cluster Security",
        description: "Dynamic volume provisioning, RBAC roles, and Secrets management.",
        order: 3,
        topics: [
          {
            id: "top-3-1",
            module_id: "mod-3",
            title: "StorageClasses, PersistentVolumes & CSI Drivers",
            description: "Volume access modes (RWO, RWX, ROX), reclaim policies, and expansion.",
            estimated_minutes: 45,
            day_number: 7,
            kind: "core",
            practice_task: "Provision an EBS or NFS volume dynamically using a custom StorageClass.",
            status: "not_started",
            mastery_score: null,
          },
          {
            id: "top-3-2",
            module_id: "mod-3",
            title: "RBAC, ServiceAccounts & OIDC Authentication",
            description: "Roles, ClusterRoles, RoleBindings, token projection, and principle of least privilege.",
            estimated_minutes: 45,
            day_number: 8,
            kind: "core",
            practice_task: "Create a read-only auditor ServiceAccount scoped to a specific dev namespace.",
            status: "not_started",
            mastery_score: null,
          },
          {
            id: "top-3-3",
            module_id: "mod-3",
            title: "System Architecture Revision & Mock Interview Drills",
            description: "Scenario-based troubleshooting: OOMKilled pods, CrashLoopBackOff, and etcd quorum loss recovery.",
            estimated_minutes: 60,
            day_number: 9,
            kind: "revision",
            practice_task: "Diagnose and fix 3 deliberate cluster failure scenarios under timed pressure.",
            status: "not_started",
            mastery_score: null,
          },
        ],
      },
    ],
  },
];

const DEFAULT_LESSONS: Lesson[] = [
  {
    id: "lesson-k8s-top-1-1",
    topic_id: "top-1-1",
    goal_id: "goal-k8s-101",
    version: "standard",
    title: "Pod Lifecycle, Init Containers & Probes in Kubernetes",
    overview: "Every Kubernetes workload ultimately runs as Pods. Mastering the states a Pod travels through — Pending, Running, Succeeded, Failed, Unknown — and how kubelet uses Probes to determine container health is crucial for building resilient distributed systems.",
    objectives: [
      "Explain the exact transition stages of a Pod from API submission to termination.",
      "Distinguish between Startup, Liveness, and Readiness probes and choose proper timing thresholds.",
      "Understand how Init Containers run sequentially before application containers start.",
      "Diagnose CrashLoopBackOff and OOMKilled errors efficiently using kubectl commands.",
    ],
    sections: [
      {
        id: "sec-1",
        title: "1. The Pod Phase Lifecycle",
        content: "When you create a Pod manifest, the API server registers the object in etcd. The scheduler discovers an unscheduled pod (`nodeName` empty) and assigns it to a suitable worker node based on resource requests and affinity rules.\n\nOnce assigned, the kubelet on the designated node takes ownership and invokes the Container Runtime (e.g. containerd). The phases are:\n- **Pending**: Accepted by API, but images are being pulled or volumes are attaching.\n- **Running**: Bound to a node and at least one container is running or starting.\n- **Succeeded**: All containers completed successfully with exit code 0 (common in Jobs).\n- **Failed**: At least one container terminated with non-zero exit code.\n- **Unknown**: kubelet lost communication with the control plane.",
        callout: {
          type: "note",
          message: "A Pod status 'Running' does NOT guarantee your app is ready to serve user HTTP requests! It only means the OS container process is active.",
        },
      },
      {
        id: "sec-2",
        title: "2. The Three Types of Probes",
        content: "kubelet uses three distinct probes to monitor container health and manage traffic flow dynamically:\n\n1. **Startup Probe**: Runs during initialization. If configured, disables liveness and readiness checks until it succeeds. Ideal for legacy or Java Spring Boot apps that take 60+ seconds to boot.\n2. **Liveness Probe**: Determines if the container needs to be restarted. If this fails consecutively beyond `failureThreshold`, kubelet kills the container process and triggers the Pod's restart policy.\n3. **Readiness Probe**: Determines if the container is ready to accept user network traffic. If it fails, the Pod's IP is automatically stripped from the Service Endpoints object, preventing HTTP 502/503 errors.",
        codeSnippet: {
          language: "yaml",
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: payment-service:v2.1
        ports:
        - containerPort: 8080
        startupProbe:
          httpGet:
            path: /health/startup
            port: 8080
          failureThreshold: 30
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10
          failureThreshold: 3`,
        },
      },
      {
        id: "sec-3",
        title: "3. Init Containers for Pre-flight Tasks",
        content: "A Pod can have multiple `initContainers` defined. They execute sequentially one after another, and each must exit with status code 0 before the application containers start.\n\nTypical use cases include:\n- Waiting for a dependent PostgreSQL database or Redis cache to be reachable.\n- Downloading configuration files, TLS certificates, or ML model weights from cloud storage into an emptyDir volume shared with the app.",
        callout: {
          type: "tip",
          message: "If an init container fails, kubelet restarts the Pod repeatedly according to the restartPolicy (unless restartPolicy: Never is set).",
        },
      },
    ],
    key_terms: [
      {
        term: "Kubelet",
        definition: "The node agent running on each worker node responsible for pod lifecycle, container runtime invocation, and probe execution.",
      },
      {
        term: "Readiness Probe",
        definition: "A diagnostic check that flags whether a container is prepared to receive traffic; failing it removes the pod from service endpoints without killing it.",
      },
      {
        term: "Liveness Probe",
        definition: "A health check that determines whether the container is healthy; failing it causes kubelet to restart the container.",
      },
      {
        term: "OOMKilled",
        definition: "Container exit code 137 triggered by Linux kernel OOM killer when the process attempts to consume memory exceeding its spec.containers[].resources.limits.memory.",
      },
    ],
    worked_example: {
      title: "Troubleshooting a CrashLoopBackOff due to Bad Liveness Probe",
      problem: "A newly rolled out Python FastAPI service is crashing repeatedly every 40 seconds. `kubectl get pods` shows status `CrashLoopBackOff` with 5 restarts.",
      steps: [
        {
          step_number: 1,
          instruction: "Run `kubectl describe pod <pod-name>` to examine events at the bottom.",
          explanation: "You notice the event: 'Liveness probe failed: HTTP probe failed with statuscode: 500' occurring after 30 seconds.",
        },
        {
          step_number: 2,
          instruction: "Inspect the liveness probe endpoint `/health/live` in the application code.",
          explanation: "The developer coded the liveness probe to query the database. When the database experienced transient latency, the liveness probe timed out and caused kubelet to kill the entire pod!",
        },
        {
          step_number: 3,
          instruction: "Separate liveness check from readiness check.",
          explanation: "Liveness should only verify that the Python process is alive (shallow check). Readiness should verify downstream database connections (deep check). Once separated, transient DB blips only pause traffic instead of restarting pods.",
        },
      ],
      takeaway: "Never include external dependencies like databases or third-party APIs inside a Liveness Probe. Reserve dependency checks for Readiness Probes.",
    },
    common_mistakes: [
      {
        mistake: "Configuring Liveness probe with initialDelaySeconds shorter than app cold start.",
        why: "kubelet will kill the container before it even finishes booting, throwing the pod into permanent CrashLoopBackOff.",
        solution: "Use a Startup Probe with high failureThreshold, or provide generous initialDelaySeconds.",
      },
      {
        mistake: "Checking external services in Liveness probes.",
        why: "If PostgreSQL goes down, all your application pods will restart simultaneously, causing a catastrophic cluster-wide thundering herd.",
        solution: "Liveness probes should be internal-only (e.g. process is responding to ping). Use Readiness probes for dependency checks.",
      },
    ],
    summary: "Pods progress through distinct phases. Always isolate startup, liveness, and readiness responsibilities. Probes are your first line of defense against serving broken requests or leaving hung threads running.",
    simple_explanation: "Think of a Pod like a chef in a restaurant kitchen. The Startup probe checks if the chef has arrived and tied their apron. The Liveness probe checks if the chef hasn't passed out. The Readiness probe checks if the chef has clean pans ready to take orders. If the pans are dirty (readiness fails), the waiter pauses orders for that chef, but doesn't fire them. If the chef passes out (liveness fails), the manager calls an ambulance and brings in a new chef (restarts container)!",
    created_at: "2026-10-16T10:00:00Z",
  },
];

const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: "quiz-top-1-1",
    topic_id: "top-1-1",
    topic_title: "Pod Lifecycle & Probes",
    goal_id: "goal-k8s-101",
    title: "Mastery Check: Pod Lifecycle & Probes",
    purpose: "check",
    questions: [
      {
        id: "q-1",
        question: "What happens when a container's Readiness Probe fails, but its Liveness Probe continues to succeed?",
        options: [
          "kubelet immediately terminates and restarts the container.",
          "The Pod is removed from the associated Service Endpoints, so no new traffic is routed to it.",
          "The Pod enters the Failed phase and the node marks it unschedulable.",
          "kubelet sends a SIGKILL signal after the terminationGracePeriodSeconds expires.",
        ],
        correct_option_index: 1,
        explanation: "Readiness probes control traffic routing. When they fail, kubelet isolates the pod by stripping its IP from Endpoints, allowing it to recover or finish current tasks without receiving new requests.",
        concept: "Readiness vs Liveness Probes",
      },
      {
        id: "q-2",
        question: "Why is it considered an anti-pattern to check a downstream database connection inside a Liveness Probe?",
        options: [
          "Because database connections require TLS which kubelet cannot perform.",
          "Because a database outage will cause all pods across the cluster to restart in unison, worsening the outage.",
          "Because liveness probes can only execute shell scripts, not network calls.",
          "Because kubelet will automatically scale down the Deployment to zero replicas.",
        ],
        correct_option_index: 1,
        explanation: "If the DB is down or slow, checking it in liveness probes kills the app containers. This creates a cascading failure (thundering herd) where every pod reboots simultaneously.",
        concept: "Probe Failure Cascades",
      },
      {
        id: "q-3",
        question: "If an Init Container fails with exit code 1, what does kubelet do?",
        options: [
          "Bypasses the init container and proceeds to boot the main application container.",
          "Terminates the worker node and reschedules the pod elsewhere.",
          "Restarts the pod according to its restartPolicy, re-running all init containers from the beginning.",
          "Converts the container into a background DaemonSet.",
        ],
        correct_option_index: 2,
        explanation: "Init containers must complete successfully in sequential order before application containers can even be created. If one fails, the pod restarts according to restartPolicy.",
        concept: "Init Container Execution Flow",
      },
      {
        id: "q-4",
        question: "Which probe is specifically designed to protect slow-starting applications (like Java/JVM) without extending the regular liveness probe timeout?",
        options: [
          "Readiness Probe",
          "Startup Probe",
          "Drain Probe",
          "PreStop Hook",
        ],
        correct_option_index: 1,
        explanation: "Startup probes were introduced to handle slow initialization. While active, they disable liveness and readiness checks until startup succeeds.",
        concept: "Startup Probe Design",
      },
    ],
    attempt: {
      id: "attempt-1",
      quiz_id: "quiz-top-1-1",
      topic_id: "top-1-1",
      goal_id: "goal-k8s-101",
      score: 4,
      total_questions: 4,
      percentage: 100,
      answers: [
        { question_id: "q-1", selected_option_index: 1, is_correct: true },
        { question_id: "q-2", selected_option_index: 1, is_correct: true },
        { question_id: "q-3", selected_option_index: 2, is_correct: true },
        { question_id: "q-4", selected_option_index: 1, is_correct: true },
      ],
      weak_concepts: [],
      next_step_recommendation: "Great job! You achieved 100% mastery on Pod lifecycle. Ready to move on to ReplicaSets and Zero-Downtime Rollouts.",
      submitted_at: "2026-10-18T14:22:00Z",
    },
  },
];

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    goal_id: "goal-k8s-101",
    title: "Kubernetes Production Patterns & Architecture",
    original_name: "k8s-prod-patterns.pdf",
    kind: "pdf",
    size_bytes: 2840500,
    chunk_count: 24,
    status: "ready",
    created_at: "2026-10-15T12:00:00Z",
    passages: [
      {
        id: "pas-1",
        page_number: 14,
        content: "When designing high-availability ingress routing in production Kubernetes, always pair cert-manager with an ingress-nginx DaemonSet or LoadBalancer service with externalTrafficPolicy: Local to preserve client IP addresses.",
      },
      {
        id: "pas-2",
        page_number: 22,
        content: "Probes must be tuned to avoid false restarts. A failureThreshold of 3 with periodSeconds: 10 provides a 30-second window before termination, accommodating short CPU throttling spikes.",
      },
      {
        id: "pas-3",
        page_number: 37,
        content: "Stateful workloads requiring stable network identifiers and ordered scaling must use StatefulSets accompanied by a Headless Service (spec.clusterIP: None).",
      },
    ],
  },
  {
    id: "doc-2",
    goal_id: "goal-k8s-101",
    title: "Interview Cheat Sheet: Common Failure Modes",
    original_name: "k8s-interview-notes.txt",
    kind: "notes",
    size_bytes: 45200,
    chunk_count: 8,
    status: "ready",
    created_at: "2026-10-16T08:30:00Z",
    passages: [
      {
        id: "pas-4",
        page_number: 1,
        content: "Key troubleshooting flow for Pods: kubectl get pods -o wide -> kubectl describe pod -> kubectl logs --previous -> inspect node memory pressure and dmesg for OOM.",
      },
    ],
  },
];

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    goal_id: "goal-k8s-101",
    front: "What is the key difference between a ClusterIP and a NodePort service?",
    back: "ClusterIP is accessible only within the cluster on an internal IP. NodePort exposes the service on each node's IP at a static port (30000-32767), making it reachable from outside the cluster.",
    stage: "review",
    repetition_count: 3,
    interval_days: 4,
    due_at: new Date(Date.now() - 3600000).toISOString(), // due now
    last_reviewed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "fc-2",
    goal_id: "goal-k8s-101",
    front: "What happens when externalTrafficPolicy is set to 'Local' on a LoadBalancer Service?",
    back: "It preserves the client source IP and routes traffic only to pods on the node that received the request, eliminating an extra network hop. However, if a node has no pods, the connection is dropped.",
    stage: "review",
    repetition_count: 2,
    interval_days: 2,
    due_at: new Date(Date.now() - 1800000).toISOString(), // due now
    last_reviewed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "fc-3",
    goal_id: "goal-k8s-101",
    front: "What does exit code 137 indicate in a Kubernetes container?",
    back: "Exit code 137 means the container was terminated by SIGKILL (128 + 9), most commonly due to an Out of Memory (OOMKilled) condition enforced by the Linux kernel.",
    stage: "mastered",
    repetition_count: 5,
    interval_days: 14,
    due_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    last_reviewed_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "fc-4",
    goal_id: "goal-k8s-101",
    front: "How does a Headless Service differ from a standard ClusterIP Service?",
    back: "A Headless Service sets spec.clusterIP to 'None'. Instead of proxying connections via a single IP, CoreDNS directly returns the A/AAAA records for all matching backing Pod IPs.",
    stage: "learning",
    repetition_count: 1,
    interval_days: 1,
    due_at: new Date(Date.now() - 7200000).toISOString(), // due now
    last_reviewed_at: null,
  },
];

const DEFAULT_EXPORTS: ExportItem[] = [
  {
    id: "exp-1",
    goal_id: "goal-k8s-101",
    kind: "roadmap",
    title: "Kubernetes Production Roadmap v1.pdf",
    format: "pdf",
    size_kb: 420,
    created_at: "2026-10-18T10:00:00Z",
    status: "ready",
  },
  {
    id: "exp-2",
    goal_id: "goal-k8s-101",
    kind: "lesson",
    title: "Lesson Notes: Pod Lifecycle & Probes.pdf",
    format: "pdf",
    size_kb: 285,
    created_at: "2026-10-19T14:30:00Z",
    status: "ready",
  },
];

// Helper to safely read and write JSON to localStorage with fallback
export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// User Profile Operations
export function getUserProfile(): UserProfile {
  return getFromStorage(STORAGE_KEYS.USER, DEFAULT_USER);
}

export function saveUserProfile(profile: UserProfile): void {
  saveToStorage(STORAGE_KEYS.USER, profile);
}

// Goals Operations
export function getGoals(): Goal[] {
  return getFromStorage(STORAGE_KEYS.GOALS, DEFAULT_GOALS);
}

export function saveGoals(goals: Goal[]): void {
  saveToStorage(STORAGE_KEYS.GOALS, goals);
}

export function getGoalById(id: string): Goal | undefined {
  const goals = getGoals();
  return goals.find((g) => g.id === id);
}

export function addGoal(goal: Goal): void {
  const goals = getGoals();
  goals.unshift(goal);
  saveGoals(goals);
}

export function updateGoal(id: string, updates: Partial<Goal>): Goal | undefined {
  const goals = getGoals();
  const index = goals.findIndex((g) => g.id === id);
  if (index === -1) return undefined;
  goals[index] = { ...goals[index], ...updates, updated_at: new Date().toISOString() };
  saveGoals(goals);
  return goals[index];
}

export function deleteGoalPermanently(id: string): void {
  const goals = getGoals().filter((g) => g.id !== id);
  saveGoals(goals);
}

// Roadmaps Operations
export function getRoadmaps(): Roadmap[] {
  return getFromStorage(STORAGE_KEYS.ROADMAPS, DEFAULT_ROADMAPS);
}

export function saveRoadmaps(roadmaps: Roadmap[]): void {
  saveToStorage(STORAGE_KEYS.ROADMAPS, roadmaps);
}

export function getRoadmapsForGoal(goalId: string): Roadmap[] {
  return getRoadmaps().filter((r) => r.goal_id === goalId);
}

export function getCurrentRoadmapForGoal(goalId: string): Roadmap | undefined {
  const goalRoadmaps = getRoadmapsForGoal(goalId);
  return goalRoadmaps.find((r) => r.status === "current") || goalRoadmaps[0];
}

export function addRoadmap(roadmap: Roadmap): void {
  const roadmaps = getRoadmaps();
  // Mark earlier roadmaps for this goal as superseded if this one is current
  if (roadmap.status === "current") {
    for (const r of roadmaps) {
      if (r.goal_id === roadmap.goal_id) {
        r.status = "superseded";
      }
    }
  }
  roadmaps.unshift(roadmap);
  saveRoadmaps(roadmaps);
}

export function setRoadmapCurrent(goalId: string, roadmapId: string): void {
  const roadmaps = getRoadmaps();
  for (const r of roadmaps) {
    if (r.goal_id === goalId) {
      r.status = r.id === roadmapId ? "current" : "superseded";
    }
  }
  saveRoadmaps(roadmaps);
}

export function updateTopicStatus(
  goalId: string,
  topicId: string,
  status: "not_started" | "in_progress" | "completed",
  score?: number,
  readingTimeSeconds?: number
): void {
  const roadmaps = getRoadmaps();
  for (const r of roadmaps) {
    if (r.goal_id === goalId) {
      for (const m of r.modules) {
        for (const t of m.topics) {
          if (t.id === topicId) {
            t.status = status;
            if (score !== undefined) t.mastery_score = score;
            if (readingTimeSeconds !== undefined) {
              t.reading_time_seconds = (t.reading_time_seconds || 0) + readingTimeSeconds;
            }
            if (status === "completed" && !t.completed_at) {
              t.completed_at = new Date().toISOString();
            }
          }
        }
      }
    }
  }
  saveRoadmaps(roadmaps);
}

export function logTopicReadingTime(
  goalId: string,
  topicId: string,
  durationSeconds: number,
  markCompleted: boolean = false
): { totalSeconds: number; topic: RoadmapTopic | null } {
  const roadmaps = getRoadmaps();
  let updatedTopic: RoadmapTopic | null = null;
  for (const r of roadmaps) {
    if (r.goal_id === goalId) {
      for (const m of r.modules) {
        for (const t of m.topics) {
          if (t.id === topicId) {
            t.reading_time_seconds = (t.reading_time_seconds || 0) + durationSeconds;
            if (markCompleted) {
              t.status = "completed";
              if (!t.completed_at) t.completed_at = new Date().toISOString();
            } else if (t.status === "not_started") {
              t.status = "in_progress";
            }
            updatedTopic = { ...t };
          }
        }
      }
    }
  }
  saveRoadmaps(roadmaps);
  return { totalSeconds: updatedTopic?.reading_time_seconds || durationSeconds, topic: updatedTopic };
}

export function getSessionDurationMetrics(
  goalId?: string,
  topicId?: string
): SessionDurationMetric[] {
  const all = getFromStorage<SessionDurationMetric[]>(STORAGE_KEYS.SESSION_METRICS, []);
  return all.filter((m) => {
    if (goalId && m.goal_id !== goalId) return false;
    if (topicId && m.topic_id !== topicId) return false;
    return true;
  });
}

export function saveSessionDurationMetricLocal(
  metric: SessionDurationMetric
): SessionDurationMetric {
  const all = getFromStorage<SessionDurationMetric[]>(STORAGE_KEYS.SESSION_METRICS, []);
  const filtered = all.filter((m) => m.id !== metric.id);
  filtered.unshift(metric);
  saveToStorage(STORAGE_KEYS.SESSION_METRICS, filtered);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studypilot:session_duration_logged", { detail: metric }));
  }
  return metric;
}

// Lessons Operations
export function getLessons(): Lesson[] {
  return getFromStorage(STORAGE_KEYS.LESSONS, DEFAULT_LESSONS);
}

export function saveLessons(lessons: Lesson[]): void {
  saveToStorage(STORAGE_KEYS.LESSONS, lessons);
}

export function getLessonByTopicId(topicId: string): Lesson | undefined {
  return getLessons().find((l) => l.topic_id === topicId);
}

export function addLesson(lesson: Lesson): void {
  const lessons = getLessons().filter((l) => l.topic_id !== lesson.topic_id);
  lessons.push(lesson);
  saveLessons(lessons);
}

// Quizzes Operations
export function getQuizzes(): Quiz[] {
  return getFromStorage(STORAGE_KEYS.QUIZZES, DEFAULT_QUIZZES);
}

export function saveQuizzes(quizzes: Quiz[]): void {
  saveToStorage(STORAGE_KEYS.QUIZZES, quizzes);
}

export function getQuizByTopicId(topicId: string): Quiz | undefined {
  return getQuizzes().find((q) => q.topic_id === topicId);
}

export function addQuiz(quiz: Quiz): void {
  const quizzes = getQuizzes().filter((q) => q.topic_id !== quiz.topic_id);
  quizzes.push(quiz);
  saveQuizzes(quizzes);
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  const quizzes = getQuizzes();
  for (const q of quizzes) {
    if (q.id === attempt.quiz_id) {
      q.attempt = attempt;
    }
  }
  saveQuizzes(quizzes);

  // Also update topic status in roadmap
  updateTopicStatus(attempt.goal_id, attempt.topic_id, "completed", attempt.percentage);
}

// Documents Operations
export function getDocumentsForGoal(goalId: string): DocumentItem[] {
  const allDocs = getFromStorage<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
  return allDocs.filter((d) => d.goal_id === goalId);
}

export function addDocument(doc: DocumentItem): void {
  const allDocs = getFromStorage<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
  allDocs.unshift(doc);
  saveToStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
}

export function deleteDocument(docId: string): void {
  const allDocs = getFromStorage<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS).filter(
    (d) => d.id !== docId
  );
  saveToStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
}

export function renameDocument(docId: string, newTitle: string): void {
  const allDocs = getFromStorage<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
  const doc = allDocs.find((d) => d.id === docId);
  if (doc) {
    doc.title = newTitle;
    saveToStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
  }
}

// Flashcards Operations
export function getFlashcardsForGoal(goalId: string): Flashcard[] {
  const allCards = getFromStorage<Flashcard[]>(STORAGE_KEYS.FLASHCARDS, DEFAULT_FLASHCARDS);
  return allCards.filter((c) => c.goal_id === goalId);
}

export function addFlashcard(card: Flashcard): void {
  const allCards = getFromStorage<Flashcard[]>(STORAGE_KEYS.FLASHCARDS, DEFAULT_FLASHCARDS);
  allCards.unshift(card);
  saveToStorage(STORAGE_KEYS.FLASHCARDS, allCards);
}

export function updateFlashcardReview(
  cardId: string,
  rating: "again" | "hard" | "good" | "easy"
): void {
  const allCards = getFromStorage<Flashcard[]>(STORAGE_KEYS.FLASHCARDS, DEFAULT_FLASHCARDS);
  const card = allCards.find((c) => c.id === cardId);
  if (!card) return;

  const now = Date.now();
  let nextIntervalDays = 1;
  let newStage: Flashcard["stage"] = card.stage;

  if (rating === "again") {
    nextIntervalDays = 0.05; // ~1 hour
    newStage = "learning";
  } else if (rating === "hard") {
    nextIntervalDays = Math.max(1, Math.round(card.interval_days * 1.2));
    newStage = "learning";
  } else if (rating === "good") {
    nextIntervalDays = Math.max(2, Math.round(card.interval_days * 2.2));
    newStage = "review";
  } else if (rating === "easy") {
    nextIntervalDays = Math.max(4, Math.round(card.interval_days * 3.5));
    newStage = "mastered";
  }

  card.stage = newStage;
  card.interval_days = nextIntervalDays;
  card.repetition_count += 1;
  card.last_reviewed_at = new Date(now).toISOString();
  card.due_at = new Date(now + nextIntervalDays * 86400000).toISOString();

  saveToStorage(STORAGE_KEYS.FLASHCARDS, allCards);
}

export function deleteFlashcard(cardId: string): void {
  const allCards = getFromStorage<Flashcard[]>(STORAGE_KEYS.FLASHCARDS, DEFAULT_FLASHCARDS).filter(
    (c) => c.id !== cardId
  );
  saveToStorage(STORAGE_KEYS.FLASHCARDS, allCards);
}

// Exports Operations
export function getExportsForGoal(goalId: string): ExportItem[] {
  const all = getFromStorage<ExportItem[]>(STORAGE_KEYS.EXPORTS, DEFAULT_EXPORTS);
  return all.filter((e) => e.goal_id === goalId);
}

export function addExport(item: ExportItem): void {
  const all = getFromStorage<ExportItem[]>(STORAGE_KEYS.EXPORTS, DEFAULT_EXPORTS);
  all.unshift(item);
  saveToStorage(STORAGE_KEYS.EXPORTS, all);
}

export function deleteExport(exportId: string): void {
  const all = getFromStorage<ExportItem[]>(STORAGE_KEYS.EXPORTS, DEFAULT_EXPORTS).filter(
    (e) => e.id !== exportId
  );
  saveToStorage(STORAGE_KEYS.EXPORTS, all);
}

// Learning Resources (YouTube educational curation)
const DEFAULT_RESOURCES: LearningResource[] = [
  {
    id: "res-1",
    goal_id: "goal-k8s-101",
    topic_id: "top-1-1",
    title: "Kubernetes Pod Lifecycle & Probes Deep Dive",
    channel: "TechWorld with Nana",
    youtube_id: "X48VuDVv0do",
    url: "https://www.youtube.com/watch?v=X48VuDVv0do",
    thumbnail_url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop&q=60",
    duration: "18:42",
    language: "en",
    relevance_score: 98,
    description: "Clear architectural walkthrough of Kubernetes Pod states, startup probes, readiness, and liveness handlers.",
  },
  {
    id: "res-2",
    goal_id: "goal-k8s-101",
    topic_id: "top-1-1",
    title: "Kubernetes Pod Lifecycle Explained in Hindi (हिंदी)",
    channel: "Cloud Gyan Hindi",
    youtube_id: "k8s_hindi_01",
    url: "https://www.youtube.com/results?search_query=kubernetes+pod+lifecycle+hindi",
    thumbnail_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60",
    duration: "24:15",
    language: "hi",
    relevance_score: 94,
    description: "कुबेरनेट्स पॉड लाइफसाइकिल और प्रोब्स को हिंदी में समझें।",
  },
  {
    id: "res-3",
    goal_id: "goal-k8s-101",
    topic_id: "top-1-2",
    title: "Zero-Downtime Rolling Updates in Kubernetes",
    channel: "KubeCon & CloudNativeCon",
    youtube_id: "rolling_updates_cncf",
    url: "https://www.youtube.com/results?search_query=kubernetes+rolling+update+kubecon",
    thumbnail_url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=60",
    duration: "32:10",
    language: "en",
    relevance_score: 96,
    description: "Production strategies for zero-downtime rollouts, maxSurge, maxUnavailable, and graceful pod termination.",
  },
  {
    id: "res-4",
    goal_id: "goal-k8s-101",
    title: "Cloud & Kubernetes Foundation Tutorial in Odia (ଓଡ଼ିଆ)",
    channel: "Tech Odia Academy",
    youtube_id: "k8s_odia_intro",
    url: "https://www.youtube.com/results?search_query=cloud+computing+odia",
    thumbnail_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60",
    duration: "21:30",
    language: "or",
    relevance_score: 91,
    description: "କ୍ଲାଉଡ୍ କମ୍ପ୍ୟୁଟିଂ ଏବଂ କୁବର୍ଣ୍ଣେଟସ୍ ସରଳ ଭାଷାରେ ବୁଝନ୍ତୁ।",
  },
];

export function getResourcesForGoal(goalId: string): LearningResource[] {
  const all = getFromStorage<LearningResource[]>(STORAGE_KEYS.RESOURCES, DEFAULT_RESOURCES);
  return all.filter((r) => r.goal_id === goalId);
}

export function getResourcesForTopic(topicId: string): LearningResource[] {
  const all = getFromStorage<LearningResource[]>(STORAGE_KEYS.RESOURCES, DEFAULT_RESOURCES);
  return all.filter((r) => r.topic_id === topicId);
}

export function addResource(item: LearningResource): void {
  const all = getFromStorage<LearningResource[]>(STORAGE_KEYS.RESOURCES, DEFAULT_RESOURCES);
  all.unshift(item);
  saveToStorage(STORAGE_KEYS.RESOURCES, all);
}

// Reset data to demo state
export function resetToDemoData(): void {
  localStorage.clear();
  saveToStorage(STORAGE_KEYS.USER, DEFAULT_USER);
  saveToStorage(STORAGE_KEYS.GOALS, DEFAULT_GOALS);
  saveToStorage(STORAGE_KEYS.ROADMAPS, DEFAULT_ROADMAPS);
  saveToStorage(STORAGE_KEYS.LESSONS, DEFAULT_LESSONS);
  saveToStorage(STORAGE_KEYS.QUIZZES, DEFAULT_QUIZZES);
  saveToStorage(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
  saveToStorage(STORAGE_KEYS.FLASHCARDS, DEFAULT_FLASHCARDS);
  saveToStorage(STORAGE_KEYS.EXPORTS, DEFAULT_EXPORTS);
  saveToStorage(STORAGE_KEYS.RESOURCES, DEFAULT_RESOURCES);
  saveToStorage(STORAGE_KEYS.SESSION_METRICS, []);
}
