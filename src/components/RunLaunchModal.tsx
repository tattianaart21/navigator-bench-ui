import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import {
  SAMPLE_WEB_BROWSER_EXTENSION_DIR,
  SAMPLE_WEB_BROWSER_PATH,
  SAMPLE_WEB_BROWSER_USER_DIR,
} from "../data/sampleRunExamples";
import type { BenchmarkData, BenchmarkRunLaunchDefaults } from "../types/benchmark";

export type RunLaunchForm = {
  web_browser_path: string;
  web_browser_extension_dir: string;
  web_browser_user_dir: string;
  pipeline: string;
  max_steps: number;
  max_concurrent: number;
  planner_model: string;
  planner_version: string;
  navigator_model: string;
  navigator_version: string;
  judge_name: string;
  result_dir: string;
  bench_test_path: string;
  gigado_backend_url: string;
  user_id: string;
  run_number: number;
  kubernetes_pod_id: string;
  created_at: string;
  save_screenshots: boolean;
  screenshots_without_markup: boolean;
};

const PIPELINES = ["full_stack", "navigator_only", "planner_navigator"];
const MODELS = ["gpt-4.1", "gpt-4o-mini", "claude-3-5-sonnet"];
const VERSIONS = ["1.2.0", "1.1.4", "0.9.1"];
const JUDGES = ["judge-llm-v1", "judge-llm-v2", "none"];

const initialForm: RunLaunchForm = {
  web_browser_path: SAMPLE_WEB_BROWSER_PATH,
  web_browser_extension_dir: SAMPLE_WEB_BROWSER_EXTENSION_DIR,
  web_browser_user_dir: SAMPLE_WEB_BROWSER_USER_DIR,
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
  user_id: "user-42",
  run_number: 1,
  kubernetes_pod_id: "",
  created_at: new Date().toISOString(),
  save_screenshots: true,
  screenshots_without_markup: false,
};

function mergeLaunchForm(base: RunLaunchForm, d?: BenchmarkRunLaunchDefaults | null): RunLaunchForm {
  if (!d) return base;
  const o = { ...base };
  (Object.entries(d) as [keyof BenchmarkRunLaunchDefaults, string | number | boolean | undefined][]).forEach(
    ([k, v]) => {
      if (v !== undefined && k in o) {
        (o as Record<string, unknown>)[k as string] = v;
      }
    }
  );
  return o;
}

export type RunLaunchSubmitPayload = RunLaunchForm & {
  benchmarkId: string;
  selectedTaskInternalIds: string[] | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  benchmarks: BenchmarkData[];
  defaultBenchmarkId: string | null;
  title?: string;
  /** если передан — в модалке не показываем выбор бенча */
  lockedBenchmarkId?: string | null;
  selectedTaskIds?: string[] | null;
  onSubmit: (payload: RunLaunchSubmitPayload) => void;
};

export default function RunLaunchModal({
  open,
  onClose,
  benchmarks,
  defaultBenchmarkId,
  title = "Запуск бенчмарка",
  lockedBenchmarkId,
  selectedTaskIds,
  onSubmit,
}: Props) {
  const [benchId, setBenchId] = useState<string>(defaultBenchmarkId ?? benchmarks[0]?.id ?? "");
  const [form, setForm] = useState<RunLaunchForm>(initialForm);

  const effectiveBenchId = lockedBenchmarkId ?? benchId;

  useEffect(() => {
    if (!open) return;
    const id = lockedBenchmarkId ?? defaultBenchmarkId ?? benchmarks[0]?.id ?? "";
    setBenchId(id);
    const b = benchmarks.find((x) => x.id === id);
    setForm(
      mergeLaunchForm(
        { ...initialForm, created_at: new Date().toISOString() },
        b?.runLaunchDefaults ?? null
      )
    );
  }, [open, defaultBenchmarkId, benchmarks, lockedBenchmarkId]);

  useEffect(() => {
    if (!open || lockedBenchmarkId) return;
    const b = benchmarks.find((x) => x.id === effectiveBenchId);
    setForm((prev) =>
      mergeLaunchForm(
        { ...initialForm, created_at: prev.created_at },
        b?.runLaunchDefaults ?? null
      )
    );
  }, [effectiveBenchId, benchmarks, open, lockedBenchmarkId]);

  const benchOptions = useMemo(
    () =>
      benchmarks.map((b) => ({
        id: b.id,
        label: `${b.name} (${b.versions[b.versions.length - 1]?.label ?? "?"})`,
      })),
    [benchmarks]
  );

  const field = (key: keyof RunLaunchForm, label: string, el: React.ReactNode) => (
    <div className="admin-field" key={String(key)}>
      <label htmlFor={`run-${String(key)}`}>{label}</label>
      {el}
    </div>
  );

  const submit = () => {
    onSubmit({
      ...form,
      benchmarkId: effectiveBenchId,
      selectedTaskInternalIds: selectedTaskIds && selectedTaskIds.length ? selectedTaskIds : null,
    });
    onClose();
  };

  return (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={submit}>
            Запустить
          </button>
        </>
      }
    >
      {!lockedBenchmarkId ? (
        <div className="admin-field">
          <label htmlFor="run-bench">Бенчмарк</label>
          <select
            id="run-bench"
            className="admin-input"
            value={effectiveBenchId}
            onChange={(e) => setBenchId(e.target.value)}
          >
            {benchOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {selectedTaskIds && selectedTaskIds.length > 0 ? (
        <p className="admin-hint">
          Будут запущены выбранные таски: <strong>{selectedTaskIds.length}</strong>
        </p>
      ) : (
        <p className="admin-hint">Запуск всего бенчмарка (все активные таски текущей версии).</p>
      )}

      <div className="admin-form-grid">
        {field(
          "web_browser_path",
          "web_browser_path",
          <input
            id="run-web_browser_path"
            className="admin-input"
            value={form.web_browser_path}
            onChange={(e) => setForm((f) => ({ ...f, web_browser_path: e.target.value }))}
          />
        )}
        {field(
          "web_browser_extension_dir",
          "web_browser_extension_dir",
          <input
            id="run-web_browser_extension_dir"
            className="admin-input"
            value={form.web_browser_extension_dir}
            onChange={(e) => setForm((f) => ({ ...f, web_browser_extension_dir: e.target.value }))}
          />
        )}
        {field(
          "web_browser_user_dir",
          "web_browser_user_dir",
          <input
            id="run-web_browser_user_dir"
            className="admin-input"
            value={form.web_browser_user_dir}
            onChange={(e) => setForm((f) => ({ ...f, web_browser_user_dir: e.target.value }))}
          />
        )}
        {field(
          "pipeline",
          "pipeline",
          <select
            id="run-pipeline"
            className="admin-input"
            value={form.pipeline}
            onChange={(e) => setForm((f) => ({ ...f, pipeline: e.target.value }))}
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
            id="run-max_steps"
            type="number"
            className="admin-input"
            value={form.max_steps}
            onChange={(e) => setForm((f) => ({ ...f, max_steps: Number(e.target.value) }))}
          />
        )}
        {field(
          "max_concurrent",
          "max_concurrent",
          <input
            id="run-max_concurrent"
            type="number"
            className="admin-input"
            value={form.max_concurrent}
            onChange={(e) => setForm((f) => ({ ...f, max_concurrent: Number(e.target.value) }))}
          />
        )}
        {field(
          "planner_model",
          "planner_model",
          <select
            id="run-planner_model"
            className="admin-input"
            value={form.planner_model}
            onChange={(e) => setForm((f) => ({ ...f, planner_model: e.target.value }))}
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
            id="run-planner_version"
            className="admin-input"
            value={form.planner_version}
            onChange={(e) => setForm((f) => ({ ...f, planner_version: e.target.value }))}
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
            id="run-navigator_model"
            className="admin-input"
            value={form.navigator_model}
            onChange={(e) => setForm((f) => ({ ...f, navigator_model: e.target.value }))}
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
            id="run-navigator_version"
            className="admin-input"
            value={form.navigator_version}
            onChange={(e) => setForm((f) => ({ ...f, navigator_version: e.target.value }))}
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
            id="run-judge_name"
            className="admin-input"
            value={form.judge_name}
            onChange={(e) => setForm((f) => ({ ...f, judge_name: e.target.value }))}
          >
            {JUDGES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
        {field(
          "result_dir",
          "result_dir",
          <input
            id="run-result_dir"
            className="admin-input"
            value={form.result_dir}
            onChange={(e) => setForm((f) => ({ ...f, result_dir: e.target.value }))}
          />
        )}
        {field(
          "bench_test_path",
          "bench_test_path",
          <input
            id="run-bench_test_path"
            className="admin-input"
            value={form.bench_test_path}
            onChange={(e) => setForm((f) => ({ ...f, bench_test_path: e.target.value }))}
          />
        )}
        {field(
          "gigado_backend_url",
          "gigado_backend_url",
          <input
            id="run-gigado_backend_url"
            className="admin-input"
            value={form.gigado_backend_url}
            onChange={(e) => setForm((f) => ({ ...f, gigado_backend_url: e.target.value }))}
          />
        )}
        {field(
          "user_id",
          "user_id",
          <input
            id="run-user_id"
            className="admin-input"
            value={form.user_id}
            onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
          />
        )}
        {field(
          "run_number",
          "run_number",
          <input
            id="run-run_number"
            type="number"
            className="admin-input"
            value={form.run_number}
            onChange={(e) => setForm((f) => ({ ...f, run_number: Number(e.target.value) }))}
          />
        )}
        {field(
          "kubernetes_pod_id",
          "kubernetes_pod_id",
          <input
            id="run-kubernetes_pod_id"
            className="admin-input"
            value={form.kubernetes_pod_id}
            onChange={(e) => setForm((f) => ({ ...f, kubernetes_pod_id: e.target.value }))}
          />
        )}
        {field(
          "created_at",
          "created_at",
          <input
            id="run-created_at"
            className="admin-input"
            readOnly
            value={form.created_at}
          />
        )}
        <div className="admin-field admin-field--switch">
          <label>save_screenshots</label>
          <button
            type="button"
            className={"admin-toggle" + (form.save_screenshots ? " admin-toggle--on" : "")}
            onClick={() => setForm((f) => ({ ...f, save_screenshots: !f.save_screenshots }))}
          >
            {form.save_screenshots ? "да" : "нет"}
          </button>
        </div>
        <div className="admin-field admin-field--switch">
          <label>screenshots_without_markup</label>
          <button
            type="button"
            className={"admin-toggle" + (form.screenshots_without_markup ? " admin-toggle--on" : "")}
            onClick={() =>
              setForm((f) => ({ ...f, screenshots_without_markup: !f.screenshots_without_markup }))
            }
          >
            {form.screenshots_without_markup ? "да" : "нет"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
