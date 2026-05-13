export type RunStatus = "В работе" | "Прерван" | "Завершен";

export interface BenchmarkVersion {
  id: string;
  label: string;
  taskCount: number;
  createdAt: string;
  isActive: boolean;
}

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  activeVersion: string;
  versions: BenchmarkVersion[];
  draftLockedBy?: string;
}

export interface RunRow {
  runId: string;
  benchName: string;
  benchVersion: string;
  pipeline: string;
  totalTasks: number;
  totalSuccess: number;
  totalFailed: number;
  startTime: string;
  finishTime: string | null;
  status: RunStatus;
  navigatorVersion: string;
  plannerVersion: string;
}

export interface RunParams {
  runId: string;
  startTime: string;
  finishTime: string | null;
  webBrowserPath: string;
  webBrowserExtensionDir: string;
  webBrowserUserDir: string;
  pipeline: string;
  maxSteps: number;
  maxConcurrent: number;
  plannerModel: string;
  plannerVersion: string;
  navigatorModel: string;
  navigatorVersion: string;
  judgeName: string;
  resultDir: string;
  benchTestPath: string;
  gigadoBackendUrl: string;
  userId: string;
  runNumber: number;
  kubernetesPodId: string;
  createdAt: string;
  saveScreenshots: boolean;
  screenshotsWithoutMarkup: boolean;
  comment: string;
}

export interface TaskResult {
  id: string;
  sessionId: string;
  chatId: string;
  taskId: string;
  taskWebName: string;
  taskQues: string;
  taskWeb: string;
  startTime: string;
  finishTime: string;
  durationSeconds: number;
  numbSteps: number;
  success: boolean;
  finalAnswer: string;
  judgeLlmResult: string | null;
  createdAt: string;
  historyJsonUrl: string;
  gifUrl: string;
}

export const agentVersions = [
  { id: "nav-1.2.0", label: "Navigator 1.2.0" },
  { id: "nav-1.1.4", label: "Navigator 1.1.4" },
  { id: "pln-0.9.1", label: "Planner 0.9.1" },
];

export const mockBenchmarks: Benchmark[] = [
  {
    id: "b1",
    name: "E-commerce навигация",
    description: "Сценарии поиска товара, корзина, оформление",
    activeVersion: "v3",
    draftLockedBy: undefined,
    versions: [
      {
        id: "b1v3",
        label: "v3",
        taskCount: 240,
        createdAt: "2026-05-10T11:00:00Z",
        isActive: true,
      },
      {
        id: "b1v2",
        label: "v2",
        taskCount: 200,
        createdAt: "2026-04-22T08:00:00Z",
        isActive: false,
      },
      {
        id: "b1v1",
        label: "v1",
        taskCount: 150,
        createdAt: "2026-03-01T12:00:00Z",
        isActive: false,
      },
    ],
  },
  {
    id: "b2",
    name: "Саппорт и тикеты",
    description: "Поиск в базе знаний, эскалация",
    activeVersion: "v1",
    versions: [
      {
        id: "b2v1",
        label: "v1",
        taskCount: 512,
        createdAt: "2026-05-01T14:00:00Z",
        isActive: true,
      },
    ],
  },
  {
    id: "b3",
    name: "Банк: личный кабинет",
    description: "Переводы, выписки, карты",
    activeVersion: "v2",
    draftLockedBy: "user@example.com",
    versions: [
      {
        id: "b3v2",
        label: "v2",
        taskCount: 180,
        createdAt: "2026-05-12T09:30:00Z",
        isActive: true,
      },
      {
        id: "b3v1",
        label: "v1",
        taskCount: 120,
        createdAt: "2026-04-15T16:00:00Z",
        isActive: false,
      },
    ],
  },
];

export const mockRuns: RunRow[] = [
  {
    runId: "run-8842",
    benchName: "E-commerce навигация",
    benchVersion: "v3",
    pipeline: "full_stack",
    totalTasks: 240,
    totalSuccess: 218,
    totalFailed: 22,
    startTime: "2026-05-13T07:12:00Z",
    finishTime: "2026-05-13T09:45:00Z",
    status: "Завершен",
    navigatorVersion: "1.2.0",
    plannerVersion: "0.9.1",
  },
  {
    runId: "run-8841",
    benchName: "Саппорт и тикеты",
    benchVersion: "v1",
    pipeline: "navigator_only",
    totalTasks: 512,
    totalSuccess: 0,
    totalFailed: 0,
    startTime: "2026-05-13T10:01:00Z",
    finishTime: null,
    status: "В работе",
    navigatorVersion: "1.2.0",
    plannerVersion: "0.9.1",
  },
  {
    runId: "run-8839",
    benchName: "E-commerce навигация",
    benchVersion: "v3",
    pipeline: "full_stack",
    totalTasks: 240,
    totalSuccess: 205,
    totalFailed: 35,
    startTime: "2026-05-11T14:00:00Z",
    finishTime: "2026-05-11T17:20:00Z",
    status: "Прерван",
    navigatorVersion: "1.1.4",
    plannerVersion: "0.9.1",
  },
];

export function getRunParams(runId: string): RunParams {
  return {
    runId,
    startTime: "2026-05-13T07:12:00Z",
    finishTime: "2026-05-13T09:45:00Z",
    webBrowserPath: "/configs/chrome-prod.yaml",
    webBrowserExtensionDir: "/plugins/nav-ext",
    webBrowserUserDir: "/profiles/bench-user",
    pipeline: "full_stack",
    maxSteps: 40,
    maxConcurrent: 8,
    plannerModel: "planner-gpt",
    plannerVersion: "0.9.1",
    navigatorModel: "navigator-v2",
    navigatorVersion: "1.2.0",
    judgeName: "judge-llm-v1",
    resultDir: "/results/run-8842",
    benchTestPath: "/data/benches/ecom-v3",
    gigadoBackendUrl: "https://api.internal/gigado",
    userId: "user-42",
    runNumber: 12,
    kubernetesPodId: "pod-abc-xyz",
    createdAt: "2026-05-13T07:11:55Z",
    saveScreenshots: true,
    screenshotsWithoutMarkup: false,
    comment: "Прогон перед релизом 1.2.0",
  };
}

export function getTaskResults(runId: string): TaskResult[] {
  const base = (i: number): TaskResult => ({
    id: `${runId}-t${i}`,
    sessionId: `sess-${1000 + i}`,
    chatId: `chat-${2000 + i}`,
    taskId: `task-${i}`,
    taskWebName: i % 3 === 0 ? "checkout" : "catalog",
    taskQues: "Найти синие кроссовки размера 42 и добавить в корзину",
    taskWeb: "https://shop.example.com",
    startTime: "2026-05-13T07:15:00Z",
    finishTime: "2026-05-13T07:18:22Z",
    durationSeconds: 202,
    numbSteps: 14,
    success: i % 7 !== 0,
    finalAnswer: "Товар добавлен в корзину",
    judgeLlmResult: i % 7 !== 0 ? "pass" : null,
    createdAt: "2026-05-13T07:18:23Z",
    historyJsonUrl: `s3://bench/history/${runId}/${i}.json`,
    gifUrl: `s3://bench/gif/${runId}/${i}.gif`,
  });
  return [1, 2, 3, 4, 5].map(base);
}
