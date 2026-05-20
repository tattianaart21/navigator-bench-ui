import type { ConfigPayload } from "../types/config";

const PIPELINES = ["full_stack", "navigator_only", "planner_navigator"];
const MODELS = ["gpt-4.1", "gpt-4o-mini", "claude-3-5-sonnet"];
const VERSIONS = ["1.2.0", "1.1.4", "0.9.1"];
const JUDGES = ["judge-llm-v1", "judge-llm-v2", "none"];

type Props = {
  payload: ConfigPayload;
  onChange: (p: ConfigPayload) => void;
  disabled?: boolean;
};

export default function ConfigPayloadForm({ payload, onChange, disabled }: Props) {
  const set = <K extends keyof ConfigPayload>(key: K, value: ConfigPayload[K]) => {
    onChange({ ...payload, [key]: value });
  };

  const field = (key: keyof ConfigPayload, label: string, el: React.ReactNode) => (
    <div className="admin-field" key={String(key)}>
      <label htmlFor={`cfg-${String(key)}`}>{label}</label>
      {el}
    </div>
  );

  return (
    <div className="admin-form-grid">
      {field(
        "pipeline",
        "pipeline",
        <select
          id="cfg-pipeline"
          className="admin-input"
          disabled={disabled}
          value={payload.pipeline}
          onChange={(e) => set("pipeline", e.target.value)}
        >
          {PIPELINES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}
      {field(
        "max_steps",
        "max_steps",
        <input
          id="cfg-max_steps"
          type="number"
          className="admin-input"
          disabled={disabled}
          value={payload.max_steps}
          onChange={(e) => set("max_steps", Number(e.target.value))}
        />
      )}
      {field(
        "max_concurrent",
        "max_concurrent",
        <input
          id="cfg-max_concurrent"
          type="number"
          className="admin-input"
          disabled={disabled}
          value={payload.max_concurrent}
          onChange={(e) => set("max_concurrent", Number(e.target.value))}
        />
      )}
      {field(
        "planner_model",
        "planner_model",
        <select
          id="cfg-planner_model"
          className="admin-input"
          disabled={disabled}
          value={payload.planner_model}
          onChange={(e) => set("planner_model", e.target.value)}
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}
      {field(
        "planner_version",
        "planner_version",
        <select
          id="cfg-planner_version"
          className="admin-input"
          disabled={disabled}
          value={payload.planner_version}
          onChange={(e) => set("planner_version", e.target.value)}
        >
          {VERSIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}
      {field(
        "navigator_model",
        "navigator_model",
        <select
          id="cfg-navigator_model"
          className="admin-input"
          disabled={disabled}
          value={payload.navigator_model}
          onChange={(e) => set("navigator_model", e.target.value)}
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}
      {field(
        "navigator_version",
        "navigator_version",
        <select
          id="cfg-navigator_version"
          className="admin-input"
          disabled={disabled}
          value={payload.navigator_version}
          onChange={(e) => set("navigator_version", e.target.value)}
        >
          {VERSIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}
      {field(
        "judge_name",
        "judge_name",
        <select
          id="cfg-judge_name"
          className="admin-input"
          disabled={disabled}
          value={payload.judge_name}
          onChange={(e) => set("judge_name", e.target.value)}
        >
          {JUDGES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}
      {field(
        "web_browser_path",
        "web_browser_path",
        <input
          id="cfg-web_browser_path"
          className="admin-input"
          disabled={disabled}
          value={payload.web_browser_path}
          onChange={(e) => set("web_browser_path", e.target.value)}
        />
      )}
      {field(
        "web_browser_extension_dir",
        "web_browser_extension_dir",
        <input
          id="cfg-web_browser_extension_dir"
          className="admin-input"
          disabled={disabled}
          value={payload.web_browser_extension_dir}
          onChange={(e) => set("web_browser_extension_dir", e.target.value)}
        />
      )}
      {field(
        "web_browser_user_dir",
        "web_browser_user_dir",
        <input
          id="cfg-web_browser_user_dir"
          className="admin-input"
          disabled={disabled}
          value={payload.web_browser_user_dir}
          onChange={(e) => set("web_browser_user_dir", e.target.value)}
        />
      )}
      {field(
        "result_dir",
        "result_dir",
        <input
          id="cfg-result_dir"
          className="admin-input"
          disabled={disabled}
          value={payload.result_dir}
          onChange={(e) => set("result_dir", e.target.value)}
        />
      )}
      {field(
        "bench_test_path",
        "bench_test_path",
        <input
          id="cfg-bench_test_path"
          className="admin-input"
          disabled={disabled}
          value={payload.bench_test_path}
          onChange={(e) => set("bench_test_path", e.target.value)}
        />
      )}
      {field(
        "gigado_backend_url",
        "gigado_backend_url",
        <input
          id="cfg-gigado_backend_url"
          className="admin-input"
          disabled={disabled}
          value={payload.gigado_backend_url}
          onChange={(e) => set("gigado_backend_url", e.target.value)}
        />
      )}
      <div className="admin-field admin-field--switch">
        <label>save_screenshots</label>
        <button
          type="button"
          disabled={disabled}
          className={"admin-toggle" + (payload.save_screenshots ? " admin-toggle--on" : "")}
          onClick={() => set("save_screenshots", !payload.save_screenshots)}
        >
          {payload.save_screenshots ? "да" : "нет"}
        </button>
      </div>
      <div className="admin-field admin-field--switch">
        <label>screenshots_without_markup</label>
        <button
          type="button"
          disabled={disabled}
          className={
            "admin-toggle" + (payload.screenshots_without_markup ? " admin-toggle--on" : "")
          }
          onClick={() => set("screenshots_without_markup", !payload.screenshots_without_markup)}
        >
          {payload.screenshots_without_markup ? "да" : "нет"}
        </button>
      </div>
    </div>
  );
}
