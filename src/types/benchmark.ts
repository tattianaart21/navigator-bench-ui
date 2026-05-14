export interface BenchTask {
  internalId: string;
  web_name: string;
  task_id: string;
  task_ques: string;
  task_web: string;
  archived: boolean;
}

export interface BenchVersionData {
  id: string;
  label: string;
  createdAt: string;
  tasks: BenchTask[];
  parentVersionId: string | null;
}

/** Ключи как в форме запуска (snake_case). */
export type BenchmarkRunLaunchDefaults = Partial<
  Record<
    | "web_browser_path"
    | "web_browser_extension_dir"
    | "web_browser_user_dir"
    | "pipeline"
    | "max_steps"
    | "max_concurrent"
    | "planner_model"
    | "planner_version"
    | "navigator_model"
    | "navigator_version"
    | "judge_name"
    | "result_dir"
    | "bench_test_path"
    | "gigado_backend_url"
    | "user_id"
    | "run_number"
    | "kubernetes_pod_id"
    | "created_at"
    | "save_screenshots"
    | "screenshots_without_markup",
    string | number | boolean
  >
>;

export interface BenchmarkData {
  id: string;
  name: string;
  versions: BenchVersionData[];
  /** Скрытый слой: подстановки в форму запуска (редактируется только в dataset-панели). */
  runLaunchDefaults?: BenchmarkRunLaunchDefaults;
}

export interface RunLaunchDraft {
  benchmarkId: string;
  selectedTaskInternalIds: string[] | null;
}
