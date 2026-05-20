/** Параметры запуска (payload версии конфига, JSON на бэкенде). */
export type ConfigPayload = {
  pipeline: string;
  max_steps: number;
  max_concurrent: number;
  planner_model: string;
  planner_version: string;
  navigator_model: string;
  navigator_version: string;
  judge_name: string;
  web_browser_path: string;
  web_browser_extension_dir: string;
  web_browser_user_dir: string;
  result_dir: string;
  bench_test_path: string;
  gigado_backend_url: string;
  save_screenshots: boolean;
  screenshots_without_markup: boolean;
};

export interface ConfigVersionData {
  id: string;
  version: number;
  label: string;
  description: string;
  createdAt: string;
  payload: ConfigPayload;
  parentVersionId: string | null;
}

export interface ConfigData {
  id: string;
  name: string;
  description: string;
  activeVersionId: string;
  versions: ConfigVersionData[];
  deleted?: boolean;
}
