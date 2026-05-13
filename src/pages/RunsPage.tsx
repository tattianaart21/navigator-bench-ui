import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRuns } from "../context/RunsContext";
import { agentVersions } from "../data/runSeed";
import type { RunRow, RunStatus } from "../types/run";
import { durationBetween, durationSince, formatIso } from "../lib/format";

function fmtNum(n: number | null): string {
  return n === null ? "—" : String(n);
}

function StatusBadge({ status }: { status: RunStatus }) {
  const cls =
    status === "Завершен"
      ? "admin-pill--ok"
      : status === "В работе"
        ? "admin-pill--warn"
        : "admin-pill--bad";
  return <span className={"admin-pill " + cls}>{status}</span>;
}

function rowDuration(r: RunRow): string {
  if (r.status === "В работе" && !r.finishTime) {
    return durationSince(r.startTime ?? r.createdAt);
  }
  return durationBetween(r.startTime, r.finishTime);
}

function matchesFilters(r: RunRow, f: FilterState): boolean {
  const checks: boolean[] = [];
  if (f.benchId.trim()) {
    checks.push(r.benchId.toLowerCase().includes(f.benchId.trim().toLowerCase()));
  }
  if (f.pipeline.trim()) {
    checks.push(r.pipeline.toLowerCase().includes(f.pipeline.trim().toLowerCase()));
  }
  if (f.maxConcurrent.trim()) {
    checks.push(String(r.maxConcurrent).includes(f.maxConcurrent.trim()));
  }
  if (f.plannerModel.trim()) {
    checks.push(r.plannerModel.toLowerCase().includes(f.plannerModel.trim().toLowerCase()));
  }
  if (f.plannerVersion.trim()) {
    checks.push(r.plannerVersion.includes(f.plannerVersion.trim()));
  }
  if (f.navigatorModel.trim()) {
    checks.push(r.navigatorModel.toLowerCase().includes(f.navigatorModel.trim().toLowerCase()));
  }
  if (f.navigatorVersion.trim()) {
    checks.push(r.navigatorVersion.includes(f.navigatorVersion.trim()));
  }
  if (f.judgeName.trim()) {
    checks.push(r.judgeName.toLowerCase().includes(f.judgeName.trim().toLowerCase()));
  }
  if (f.userId.trim()) {
    checks.push(r.userId.toLowerCase().includes(f.userId.trim().toLowerCase()));
  }
  if (f.runNumber.trim()) {
    checks.push(String(r.runNumber).includes(f.runNumber.trim()));
  }
  if (f.createdAtFrom.trim()) {
    checks.push(r.createdAt >= f.createdAtFrom.trim());
  }
  if (f.createdAtTo.trim()) {
    checks.push(r.createdAt <= f.createdAtTo.trim());
  }
  if (f.startFrom.trim()) {
    checks.push(r.startTime == null || r.startTime >= f.startFrom.trim());
  }
  if (f.startTo.trim()) {
    checks.push(r.startTime == null || r.startTime <= f.startTo.trim());
  }
  if (f.finishFrom.trim()) {
    checks.push(r.finishTime == null || r.finishTime >= f.finishFrom.trim());
  }
  if (f.finishTo.trim()) {
    checks.push(r.finishTime == null || r.finishTime <= f.finishTo.trim());
  }
  if (f.agentVersion) {
    const ver = f.agentVersion.replace(/^Navigator\s+/i, "").trim() || f.agentVersion;
    checks.push(r.navigatorVersion === ver);
  }
  return checks.every(Boolean);
}

type FilterState = {
  benchId: string;
  pipeline: string;
  maxConcurrent: string;
  plannerModel: string;
  plannerVersion: string;
  navigatorModel: string;
  navigatorVersion: string;
  judgeName: string;
  userId: string;
  runNumber: string;
  createdAtFrom: string;
  createdAtTo: string;
  startFrom: string;
  startTo: string;
  finishFrom: string;
  finishTo: string;
  agentVersion: string;
};

const emptyFilters: FilterState = {
  benchId: "",
  pipeline: "",
  maxConcurrent: "",
  plannerModel: "",
  plannerVersion: "",
  navigatorModel: "",
  navigatorVersion: "",
  judgeName: "",
  userId: "",
  runNumber: "",
  createdAtFrom: "",
  createdAtTo: "",
  startFrom: "",
  startTo: "",
  finishFrom: "",
  finishTo: "",
  agentVersion: "",
};

function runsToCsv(rows: RunRow[]): string {
  const header = [
    "bench_id",
    "pipeline",
    "total_tasks",
    "total_success",
    "total_failed",
    "start_time",
    "finish_time",
    "duration_sec_estimate",
    "status",
    "max_concurrent",
    "planner_model",
    "planner_version",
    "navigator_model",
    "navigator_version",
    "judge_name",
    "user_id",
    "run_number",
    "created_at",
  ];
  const lines = rows.map((r) =>
    [
      r.benchId,
      r.pipeline,
      r.totalTasks,
      fmtNum(r.totalSuccess),
      fmtNum(r.totalFailed),
      r.startTime ?? "",
      r.finishTime ?? "",
      rowDuration(r),
      r.status,
      r.maxConcurrent,
      r.plannerModel,
      r.plannerVersion,
      r.navigatorModel,
      r.navigatorVersion,
      r.judgeName,
      r.userId,
      r.runNumber,
      r.createdAt,
    ]
      .map((cell) => {
        const s = String(cell);
        if (s.includes('"') || s.includes(",") || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      })
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export default function RunsPage() {
  const navigate = useNavigate();
  const { runs } = useRuns();
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  const filtered = useMemo(() => runs.filter((r) => matchesFilters(r, filters)), [runs, filters]);

  const exportCsv = () => {
    const blob = new Blob([runsToCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `runs-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const field = (key: keyof FilterState, label: string, type: "text" | "datetime-local" = "text") => (
    <div className="admin-field" key={key}>
      <label htmlFor={`flt-${key}`}>{label}</label>
      <input
        id={`flt-${key}`}
        type={type}
        className="admin-input"
        value={filters[key]}
        onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/">Бенчмарки</Link>
        {" / "}
        <strong>Запуски</strong>
      </div>
      <h1 className="admin-page-title">Запуски</h1>

      <div className="admin-toolbar" style={{ flexWrap: "wrap", gap: "1rem" }}>
        <button type="button" className="admin-btn admin-btn--primary" onClick={exportCsv}>
          Экспорт CSV
        </button>
        <div className="admin-field" style={{ marginBottom: 0, minWidth: 200 }}>
          <label htmlFor="agent-filter">Версия навигатора (быстрый фильтр)</label>
          <select
            id="agent-filter"
            className="admin-input"
            value={filters.agentVersion}
            onChange={(e) => setFilters((prev) => ({ ...prev, agentVersion: e.target.value }))}
          >
            <option value="">Все</option>
            {agentVersions.map((v) => (
              <option key={v.id} value={v.label}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Поиск и фильтр</h2>
        <div className="admin-form-grid">
          {field("benchId", "bench_id")}
          {field("pipeline", "pipeline")}
          {field("maxConcurrent", "max_concurrent")}
          {field("plannerModel", "planner_model")}
          {field("plannerVersion", "planner_version")}
          {field("navigatorModel", "navigator_model")}
          {field("navigatorVersion", "navigator_version")}
          {field("judgeName", "judge_name")}
          {field("userId", "user_id")}
          {field("runNumber", "run_number")}
          {field("createdAtFrom", "created_at от", "datetime-local")}
          {field("createdAtTo", "created_at до", "datetime-local")}
          {field("startFrom", "start_time от", "datetime-local")}
          {field("startTo", "start_time до", "datetime-local")}
          {field("finishFrom", "finish_time от", "datetime-local")}
          {field("finishTo", "finish_time до", "datetime-local")}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          style={{ marginTop: "0.75rem" }}
          onClick={() => setFilters(emptyFilters)}
        >
          Сбросить фильтры
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>bench_id</th>
                <th>pipeline</th>
                <th>total_tasks</th>
                <th>total_success</th>
                <th>total_failed</th>
                <th>start_time</th>
                <th>finish_time</th>
                <th>Время выполнения</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.benchId}
                  className="clickable"
                  onClick={() => navigate(`/runs/${encodeURIComponent(r.benchId)}`)}
                >
                  <td className="cell-mono">{r.benchId}</td>
                  <td>{r.pipeline}</td>
                  <td>{r.totalTasks}</td>
                  <td>{fmtNum(r.totalSuccess)}</td>
                  <td>{fmtNum(r.totalFailed)}</td>
                  <td>{formatIso(r.startTime)}</td>
                  <td>{formatIso(r.finishTime)}</td>
                  <td>{rowDuration(r)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="admin-hint" style={{ marginTop: "1rem" }}>
        Строка открывает карточку запуска. <Link to="/compare">Сравнение</Link>
      </p>
    </>
  );
}
