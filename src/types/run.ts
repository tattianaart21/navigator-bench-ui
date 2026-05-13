export type RunStatus = "В работе" | "Прерван" | "Завершен";

/** Строка списка запусков (bench_id — идентификатор запуска). */
export interface RunRow {
  benchId: string;
  benchName: string;
  benchVersion: string;
  pipeline: string;
  totalTasks: number;
  /** null пока запуск не завершён (по ТЗ часть полей заполняется после окончания). */
  totalSuccess: number | null;
  totalFailed: number | null;
  startTime: string | null;
  finishTime: string | null;
  status: RunStatus;
  maxConcurrent: number;
  plannerModel: string;
  plannerVersion: string;
  navigatorModel: string;
  navigatorVersion: string;
  judgeName: string;
  userId: string;
  runNumber: number;
  createdAt: string;
}

export interface RunParams {
  benchId: string;
  startTime: string | null;
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
