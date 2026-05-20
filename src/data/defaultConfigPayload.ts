import type { ConfigPayload } from "../types/config";

export const DEFAULT_CONFIG_PAYLOAD: ConfigPayload = {
  web_browser_path: "/home/work/user@example/opera/usr/bin/opera",
  web_browser_extension_dir: "/home/work/user/configurable-plugin-opera/dist",
  web_browser_user_dir: "/home/work/user@example/opera/profile/",
  pipeline: "full_stack",
  max_steps: 40,
  max_concurrent: 8,
  planner_model: "gpt-4.1",
  planner_version: "0.9.1",
  navigator_model: "gpt-4.1",
  navigator_version: "1.2.0",
  judge_name: "judge-llm-v1",
  result_dir: "/results/bench-run",
  bench_test_path: "/data/benches/current",
  gigado_backend_url: "https://api.internal/gigado",
  save_screenshots: true,
  screenshots_without_markup: false,
};

export function clonePayload(p: ConfigPayload): ConfigPayload {
  return { ...p };
}
