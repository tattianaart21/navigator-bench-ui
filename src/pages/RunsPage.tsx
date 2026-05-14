import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRuns } from "../context/RunsContext";
import {
  collectFilterOptions,
  compareFiltersActive,
  emptyCompareFilters,
  filterRunsForCompare,
} from "../lib/compareRuns";
import type { CompareRunFilters } from "../lib/compareRuns";
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

/** Поиск по id запуска (bench_id), user_id и run_number — одна строка, подстрока. */
function matchesRunSearch(r: RunRow, raw: string): boolean {
  const q = raw.trim();
  if (!q) return true;
  const ql = q.toLowerCase();
  if (r.benchId.toLowerCase().includes(ql)) return true;
  if (r.userId.toLowerCase().includes(ql)) return true;
  if (String(r.runNumber).includes(q.trim())) return true;
  return false;
}

function FilterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MultiSelect(props: {
  id: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="admin-field">
      <label htmlFor={props.id}>{props.label}</label>
      <select
        id={props.id}
        multiple
        size={Math.min(8, Math.max(4, props.options.length || 1))}
        className="admin-input"
        value={props.value}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, (o) => o.value);
          props.onChange(selected);
        }}
      >
        {props.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <p className="admin-hint" style={{ margin: "0.35rem 0 0", fontSize: "0.78rem" }}>
        Ctrl/Cmd + клик — несколько значений.
      </p>
    </div>
  );
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CompareRunFilters>(() => ({ ...emptyCompareFilters }));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterOptions = useMemo(() => collectFilterOptions(runs), [runs]);

  const filtered = useMemo(() => {
    const afterSearch = runs.filter((r) => matchesRunSearch(r, searchQuery));
    return filterRunsForCompare(afterSearch, filters);
  }, [runs, searchQuery, filters]);

  const dateHints = useMemo(() => {
    const starts = runs.map((r) => r.startTime).filter(Boolean) as string[];
    const fins = runs.map((r) => r.finishTime).filter(Boolean) as string[];
    const minStart = starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : "";
    const maxStart = starts.length ? starts.reduce((a, b) => (a > b ? a : b)) : "";
    const minFin = fins.length ? fins.reduce((a, b) => (a < b ? a : b)) : "";
    const maxFin = fins.length ? fins.reduce((a, b) => (a > b ? a : b)) : "";
    return { minStart, maxStart, minFin, maxFin };
  }, [runs]);

  const exportCsv = () => {
    const blob = new Blob([runsToCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `runs-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtersDirty = compareFiltersActive(filters);
  const searchDirty = Boolean(searchQuery.trim());

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/">Бенчмарки</Link>
        {" / "}
        <strong>Запуски</strong>
      </div>
      <h1 className="admin-page-title">Запуски</h1>

      <div className="runs-page-toolbar">
        <div className="admin-field runs-page-search">
          <label htmlFor="runs-search">Поиск</label>
          <input
            id="runs-search"
            type="search"
            className="admin-input"
            placeholder="Id запуска, user_id или run_number…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <p className="admin-hint" style={{ margin: "0.35rem 0 0", fontSize: "0.78rem" }}>
            Совпадение по подстроке в полях: уникальный id запуска (bench_id), идентификатор
            пользователя и номер запуска в последовательности.
          </p>
        </div>
        <div className="runs-page-toolbar-actions">
          <button type="button" className="admin-btn admin-btn--primary" onClick={exportCsv}>
            Экспорт CSV
          </button>
          <div className="compare-toolbar runs-page-filter-trigger" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={
                "admin-icon-btn" +
                (filtersOpen ? " admin-icon-btn--active" : "") +
                (filtersDirty ? " admin-icon-btn--dot" : "")
              }
              aria-expanded={filtersOpen}
              aria-controls="runs-filters-panel"
              title={filtersOpen ? "Скрыть фильтры" : "Показать фильтры"}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <FilterIcon />
            </button>
            <span className="admin-hint" style={{ margin: 0 }}>
              {filtersOpen ? "Скрыть фильтрацию" : "Фильтрация"}
              {filtersDirty ? " · заданы условия" : ""}
            </span>
          </div>
        </div>
      </div>

      {filtersOpen ? (
        <div id="runs-filters-panel" className="admin-card admin-card-pad compare-filters-panel">
          <h2 className="visually-hidden">Фильтрация</h2>
          <p className="admin-hint" style={{ marginTop: 0 }}>
            Списки и границы дат строятся по текущим запускам в каталоге. Поиск по id, user_id и
            run_number — в поле «Поиск» выше.
          </p>
          <div className="admin-form-grid">
            <MultiSelect
              id="runs-pipeline"
              label="pipeline"
              options={filterOptions.pipelines}
              value={filters.pipeline}
              onChange={(v) => setFilters((p) => ({ ...p, pipeline: v }))}
            />
            <MultiSelect
              id="runs-planner-model"
              label="planner_model"
              options={filterOptions.plannerModels}
              value={filters.plannerModel}
              onChange={(v) => setFilters((p) => ({ ...p, plannerModel: v }))}
            />
            <MultiSelect
              id="runs-planner-ver"
              label="planner_version"
              options={filterOptions.plannerVersions}
              value={filters.plannerVersion}
              onChange={(v) => setFilters((p) => ({ ...p, plannerVersion: v }))}
            />
            <MultiSelect
              id="runs-nav-model"
              label="navigator_model"
              options={filterOptions.navigatorModels}
              value={filters.navigatorModel}
              onChange={(v) => setFilters((p) => ({ ...p, navigatorModel: v }))}
            />
            <MultiSelect
              id="runs-nav-ver"
              label="navigator_version"
              options={filterOptions.navigatorVersions}
              value={filters.navigatorVersion}
              onChange={(v) => setFilters((p) => ({ ...p, navigatorVersion: v }))}
            />
            <MultiSelect
              id="runs-judge"
              label="judge_name"
              options={filterOptions.judgeNames}
              value={filters.judgeName}
              onChange={(v) => setFilters((p) => ({ ...p, judgeName: v }))}
            />
            <div className="admin-field">
              <label htmlFor="runs-start-from">start_time с</label>
              <input
                id="runs-start-from"
                type="date"
                className="admin-input"
                value={filters.startFrom}
                onChange={(e) => setFilters((p) => ({ ...p, startFrom: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="runs-start-to">start_time по</label>
              <input
                id="runs-start-to"
                type="date"
                className="admin-input"
                value={filters.startTo}
                onChange={(e) => setFilters((p) => ({ ...p, startTo: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="runs-fin-from">finish_time с</label>
              <input
                id="runs-fin-from"
                type="date"
                className="admin-input"
                value={filters.finishFrom}
                onChange={(e) => setFilters((p) => ({ ...p, finishFrom: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="runs-fin-to">finish_time по</label>
              <input
                id="runs-fin-to"
                type="date"
                className="admin-input"
                value={filters.finishTo}
                onChange={(e) => setFilters((p) => ({ ...p, finishTo: e.target.value }))}
              />
            </div>
          </div>
          <p className="admin-hint" style={{ marginBottom: 0 }}>
            Диапазоны дат в данных: start {dateHints.minStart ? dateHints.minStart.slice(0, 10) : "—"} …{" "}
            {dateHints.maxStart ? dateHints.maxStart.slice(0, 10) : "—"}; finish{" "}
            {dateHints.minFin ? dateHints.minFin.slice(0, 10) : "—"} …{" "}
            {dateHints.maxFin ? dateHints.maxFin.slice(0, 10) : "—"}
          </p>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            style={{ marginTop: "0.75rem" }}
            onClick={() => {
              setFilters({ ...emptyCompareFilters });
              setSearchQuery("");
            }}
          >
            Сбросить поиск и фильтры
          </button>
        </div>
      ) : null}

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

      {filtered.length === 0 ? (
        <p className="admin-hint" style={{ marginTop: "1rem" }}>
          Нет запусков по заданному поиску и фильтрации.
          {(searchDirty || filtersDirty) ? (
            <>
              {" "}
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                style={{ marginLeft: "0.25rem", verticalAlign: "baseline" }}
                onClick={() => {
                  setFilters({ ...emptyCompareFilters });
                  setSearchQuery("");
                }}
              >
                Сбросить
              </button>
            </>
          ) : null}
        </p>
      ) : null}

      <p className="admin-hint" style={{ marginTop: "1rem" }}>
        Строка открывает карточку запуска. <Link to="/compare">Сравнение</Link>
      </p>
    </>
  );
}
