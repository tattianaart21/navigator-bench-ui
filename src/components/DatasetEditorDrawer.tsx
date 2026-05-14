import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBenchmarks } from "../context/BenchmarkContext";
import { useRuns } from "../context/RunsContext";
import { useDatasetEditor } from "../hooks/useDatasetEditor";
import type { BenchTask, BenchmarkRunLaunchDefaults } from "../types/benchmark";
import type { RunParams, RunRow, TaskResult } from "../types/run";

function parseBenchPath(pathname: string): string | null {
  const p = pathname.replace(/\/$/, "");
  const m = p.match(/^\/bench\/([^/]+)$/);
  return m ? m[1] : null;
}

function parseRunPath(pathname: string): string | null {
  const p = pathname.replace(/\/$/, "");
  const m = p.match(/^\/runs\/([^/]+)$/);
  return m ? m[1] : null;
}

export default function DatasetEditorDrawer() {
  const { enabled, panelOpen, disableCompletely } = useDatasetEditor();
  const location = useLocation();
  const navigate = useNavigate();
  const { benchmarks, getBenchmark, datasetPatchBenchmark } = useBenchmarks();
  const { getRunRow, getRunParams, getTaskResults, datasetPatchRun } = useRuns();

  const benchId = useMemo(() => parseBenchPath(location.pathname), [location.pathname]);
  const runId = useMemo(() => parseRunPath(location.pathname), [location.pathname]);

  const bench = benchId ? getBenchmark(benchId) : undefined;
  const latest = bench?.versions[bench.versions.length - 1];

  const [name, setName] = useState("");
  const [vLabel, setVLabel] = useState("");
  const [vCreated, setVCreated] = useState("");
  const [tasksJson, setTasksJson] = useState("");
  const [defaultsJson, setDefaultsJson] = useState("");

  const runRow = runId ? getRunRow(runId) : undefined;
  const runParams = runId ? getRunParams(runId) : undefined;
  const runTasks = runId ? getTaskResults(runId) : undefined;

  const [runRowJson, setRunRowJson] = useState("{}");
  const [runParamsJson, setRunParamsJson] = useState("{}");
  const [runTasksJson, setRunTasksJson] = useState("[]");

  useEffect(() => {
    if (!bench || !latest) return;
    setName(bench.name);
    setVLabel(latest.label);
    setVCreated(latest.createdAt.slice(0, 16));
    setTasksJson(JSON.stringify(latest.tasks, null, 2));
    setDefaultsJson(JSON.stringify(bench.runLaunchDefaults ?? {}, null, 2));
  }, [bench, latest, benchId]);

  useEffect(() => {
    if (!runId || !runRow) return;
    setRunRowJson(JSON.stringify(runRow, null, 2));
    setRunParamsJson(JSON.stringify(runParams ?? {}, null, 2));
    setRunTasksJson(JSON.stringify(runTasks ?? [], null, 2));
  }, [runId, runRow, runParams, runTasks]);

  const applyBench = useCallback(() => {
    if (!benchId || !bench || !latest) return;
    let tasks: BenchTask[];
    try {
      tasks = JSON.parse(tasksJson) as BenchTask[];
      if (!Array.isArray(tasks)) throw new Error("tasks must be array");
    } catch (e) {
      window.alert(`tasks JSON: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    let defaults: BenchmarkRunLaunchDefaults | null = null;
    try {
      const d = JSON.parse(defaultsJson || "{}");
      if (d && typeof d === "object" && !Array.isArray(d)) defaults = d as BenchmarkRunLaunchDefaults;
      else throw new Error("defaults must be object");
    } catch (e) {
      window.alert(`run defaults JSON: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    datasetPatchBenchmark(benchId, {
      name: name.trim(),
      latestVersion: {
        label: vLabel.trim(),
        createdAt: new Date(vCreated).toISOString(),
        tasks,
      },
      runLaunchDefaults: defaults,
    });
    window.alert("Сохранено (бенчмарк).");
  }, [bench, benchId, datasetPatchBenchmark, defaultsJson, latest, name, tasksJson, vCreated, vLabel]);

  const applyRun = useCallback(() => {
    if (!runId) return;
    let row: Partial<RunRow>;
    let params: Partial<RunParams>;
    let tasks: TaskResult[];
    try {
      row = JSON.parse(runRowJson) as Partial<RunRow>;
      if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("row must be object");
    } catch (e) {
      window.alert(`run row JSON: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    try {
      params = JSON.parse(runParamsJson) as Partial<RunParams>;
      if (!params || typeof params !== "object" || Array.isArray(params)) throw new Error("params must be object");
    } catch (e) {
      window.alert(`params JSON: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    try {
      tasks = JSON.parse(runTasksJson) as TaskResult[];
      if (!Array.isArray(tasks)) throw new Error("tasks must be array");
    } catch (e) {
      window.alert(`run tasks JSON: ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    datasetPatchRun(runId, { row, params, tasks });
    window.alert("Сохранено (запуск).");
  }, [datasetPatchRun, runId, runParamsJson, runRowJson, runTasksJson]);

  if (!enabled || !panelOpen) return null;

  return (
    <div className="dataset-drawer" role="dialog" aria-label="Dataset editor">
      <div className="dataset-drawer-head">
        <span>dataset · без макета</span>
        <button type="button" className="dataset-drawer-close" onClick={disableCompletely} title="Выключить">
          ×
        </button>
      </div>
      <div className="dataset-drawer-body">
        <p className="dataset-drawer-hint">
          Ctrl+Shift+Alt+D — выкл. Не для макета: только для подстановки реальных данных. Путь:{" "}
          <code>{location.pathname}</code>
        </p>

        {benchId && bench && latest ? (
          <section className="dataset-section">
            <h3>Бенчмарк {benchId}</h3>
            <label className="dataset-label">name</label>
            <input className="dataset-input" value={name} onChange={(e) => setName(e.target.value)} />
            <label className="dataset-label">Версия (label)</label>
            <input className="dataset-input" value={vLabel} onChange={(e) => setVLabel(e.target.value)} />
            <label className="dataset-label">Версия createdAt (локальное время)</label>
            <input
              type="datetime-local"
              className="dataset-input"
              value={vCreated}
              onChange={(e) => setVCreated(e.target.value)}
            />
            <label className="dataset-label">Таски (JSON массив)</label>
            <textarea className="dataset-textarea" value={tasksJson} onChange={(e) => setTasksJson(e.target.value)} />
            <label className="dataset-label">Параметры запуска по умолчанию (JSON, snake_case)</label>
            <textarea
              className="dataset-textarea"
              value={defaultsJson}
              onChange={(e) => setDefaultsJson(e.target.value)}
            />
            <button type="button" className="dataset-btn" onClick={applyBench}>
              Применить бенчмарк
            </button>
          </section>
        ) : null}

        {runId && runRow ? (
          <section className="dataset-section">
            <h3>Запуск {runId}</h3>
            <label className="dataset-label">Строка списка (JSON объект, merge)</label>
            <textarea className="dataset-textarea" value={runRowJson} onChange={(e) => setRunRowJson(e.target.value)} />
            <label className="dataset-label">Параметры запуска (JSON объект, merge)</label>
            <textarea
              className="dataset-textarea"
              value={runParamsJson}
              onChange={(e) => setRunParamsJson(e.target.value)}
            />
            <label className="dataset-label">Таски запуска (JSON массив, replace)</label>
            <textarea
              className="dataset-textarea"
              value={runTasksJson}
              onChange={(e) => setRunTasksJson(e.target.value)}
            />
            <button type="button" className="dataset-btn" onClick={applyRun}>
              Применить запуск
            </button>
          </section>
        ) : null}

        {!benchId && !runId ? (
          <section className="dataset-section">
            <h3>Выбор бенча</h3>
            <select
              className="dataset-input"
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (id) navigate(`/bench/${encodeURIComponent(id)}`);
              }}
            >
              <option value="">— перейти к бенчмарку —</option>
              {benchmarks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.id})
                </option>
              ))}
            </select>
            <p className="dataset-drawer-hint">Для запуска откройте /runs/&lt;bench_run_id&gt;</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
