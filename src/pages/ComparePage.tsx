import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useRuns } from "../context/RunsContext";
import {
  collectFilterOptions,
  defaultComparePair,
  emptyCompareFilters,
  filterRunsForCompare,
  findNextNewerSameSignature,
  findPreviousSameSignature,
  runSelectLabel,
  takeLatestRuns,
  type CompareRunFilters,
} from "../lib/compareRuns";
import { durationBetween, formatIso } from "../lib/format";
import type { RunRow } from "../types/run";

function fmtNum(n: number | null): string {
  return n === null ? "—" : String(n);
}

function mergeOptionPool(top: RunRow[], extra: RunRow[], cap: number): RunRow[] {
  const seen = new Set<string>();
  const out: RunRow[] = [];
  for (const r of [...extra, ...top]) {
    if (seen.has(r.benchId)) continue;
    seen.add(r.benchId);
    out.push(r);
    if (out.length >= cap) break;
  }
  return out;
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

export default function ComparePage() {
  const { runs } = useRuns();
  const [filters, setFilters] = useState<CompareRunFilters>(() => ({ ...emptyCompareFilters }));
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");
  const initRef = useRef(false);

  const filterOptions = useMemo(() => collectFilterOptions(runs), [runs]);

  const filtered = useMemo(() => filterRunsForCompare(runs, filters), [runs, filters]);

  const top20 = useMemo(() => takeLatestRuns(filtered, 20), [filtered]);

  const leftRow = runs.find((r) => r.benchId === leftId);
  const rightRow = runs.find((r) => r.benchId === rightId);

  const optionsLeft = useMemo(
    () => mergeOptionPool(top20, leftRow && !top20.some((r) => r.benchId === leftId) ? [leftRow] : [], 20),
    [top20, leftRow, leftId]
  );
  const optionsRight = useMemo(
    () => mergeOptionPool(top20, rightRow && !top20.some((r) => r.benchId === rightId) ? [rightRow] : [], 20),
    [top20, rightRow, rightId]
  );

  const dateHints = useMemo(() => {
    const starts = runs.map((r) => r.startTime).filter(Boolean) as string[];
    const fins = runs.map((r) => r.finishTime).filter(Boolean) as string[];
    const minStart = starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : "";
    const maxStart = starts.length ? starts.reduce((a, b) => (a > b ? a : b)) : "";
    const minFin = fins.length ? fins.reduce((a, b) => (a < b ? a : b)) : "";
    const maxFin = fins.length ? fins.reduce((a, b) => (a > b ? a : b)) : "";
    return { minStart, maxStart, minFin, maxFin };
  }, [runs]);

  useEffect(() => {
    if (!runs.length) return;
    if (!initRef.current) {
      const pool = filterRunsForCompare(runs, filters);
      const d = defaultComparePair(pool);
      setLeftId(d.leftId);
      setRightId(d.rightId);
      initRef.current = true;
      return;
    }
    if (!filtered.some((r) => r.benchId === leftId) || !filtered.some((r) => r.benchId === rightId)) {
      const d = defaultComparePair(filtered);
      setLeftId(d.leftId);
      setRightId(d.rightId);
    }
  }, [runs, filters, filtered, leftId, rightId]);

  const onChangeLeft = (id: string) => {
    setLeftId(id);
    setRightId(findPreviousSameSignature(filtered, id));
  };

  const onChangeRight = (id: string) => {
    setRightId(id);
    setLeftId(findNextNewerSameSignature(filtered, id));
  };

  const benchCell = (r: RunRow | undefined) =>
    r ? (
      <>
        {r.benchName} <span className="admin-pill admin-pill--warn">{r.benchVersion}</span>
      </>
    ) : (
      "—"
    );

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/">Бенчмарки</Link>
        {" / "}
        <strong>Сравнение</strong>
      </div>
      <h1 className="admin-page-title">Сравнение запусков</h1>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Фильтрация</h2>
        <p className="admin-hint" style={{ marginTop: 0 }}>
          Значения в списках формируются из доступных запусков. После смены фильтра пары запусков
          подбираются заново, если текущие не попадают в выборку.
        </p>
        <div className="admin-form-grid">
          <MultiSelect
            id="cf-pipeline"
            label="pipeline"
            options={filterOptions.pipelines}
            value={filters.pipeline}
            onChange={(v) => setFilters((p) => ({ ...p, pipeline: v }))}
          />
          <MultiSelect
            id="cf-planner-model"
            label="planner_model"
            options={filterOptions.plannerModels}
            value={filters.plannerModel}
            onChange={(v) => setFilters((p) => ({ ...p, plannerModel: v }))}
          />
          <MultiSelect
            id="cf-planner-ver"
            label="planner_version"
            options={filterOptions.plannerVersions}
            value={filters.plannerVersion}
            onChange={(v) => setFilters((p) => ({ ...p, plannerVersion: v }))}
          />
          <MultiSelect
            id="cf-nav-model"
            label="navigator_model"
            options={filterOptions.navigatorModels}
            value={filters.navigatorModel}
            onChange={(v) => setFilters((p) => ({ ...p, navigatorModel: v }))}
          />
          <MultiSelect
            id="cf-nav-ver"
            label="navigator_version"
            options={filterOptions.navigatorVersions}
            value={filters.navigatorVersion}
            onChange={(v) => setFilters((p) => ({ ...p, navigatorVersion: v }))}
          />
          <MultiSelect
            id="cf-judge"
            label="judge_name"
            options={filterOptions.judgeNames}
            value={filters.judgeName}
            onChange={(v) => setFilters((p) => ({ ...p, judgeName: v }))}
          />
          <div className="admin-field">
            <label htmlFor="cf-start-from">start_time с</label>
            <input
              id="cf-start-from"
              type="date"
              className="admin-input"
              value={filters.startFrom}
              onChange={(e) => setFilters((p) => ({ ...p, startFrom: e.target.value }))}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="cf-start-to">start_time по</label>
            <input
              id="cf-start-to"
              type="date"
              className="admin-input"
              value={filters.startTo}
              onChange={(e) => setFilters((p) => ({ ...p, startTo: e.target.value }))}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="cf-fin-from">finish_time с</label>
            <input
              id="cf-fin-from"
              type="date"
              className="admin-input"
              value={filters.finishFrom}
              onChange={(e) => setFilters((p) => ({ ...p, finishFrom: e.target.value }))}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="cf-fin-to">finish_time по</label>
            <input
              id="cf-fin-to"
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
          onClick={() => setFilters({ ...emptyCompareFilters })}
        >
          Сбросить фильтры
        </button>
      </div>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Выбор запусков для сравнения</h2>
        <p className="admin-hint" style={{ marginTop: 0 }}>
          По умолчанию выбираются два последних запуска с одинаковыми параметрами (бенчмарк, версия,
          pipeline, модели и судья). При смене первого запуска второй подставляется как более ранний
          с тем же набором параметров. В списках — до 20 последних запусков после фильтрации, сортировка
          по <code>created_at</code> (новые сверху).
        </p>
        <div className="admin-form-grid" style={{ maxWidth: 640 }}>
          <div className="admin-field">
            <label htmlFor="cmp-a">Поле с выпадающим списком №1</label>
            <select
              id="cmp-a"
              className="admin-input"
              value={leftId}
              onChange={(e) => onChangeLeft(e.target.value)}
            >
              {optionsLeft.map((r) => (
                <option key={r.benchId} value={r.benchId}>
                  {runSelectLabel(r)} · {r.benchId}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="cmp-b">Поле с выпадающим списком №2</label>
            <select
              id="cmp-b"
              className="admin-input"
              value={rightId}
              onChange={(e) => onChangeRight(e.target.value)}
            >
              {optionsRight.map((r) => (
                <option key={`b-${r.benchId}`} value={r.benchId}>
                  {runSelectLabel(r)} · {r.benchId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Показатель</th>
                <th>Запуск A</th>
                <th>Запуск B</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>bench_run_id</td>
                <td className="cell-mono">{leftRow?.benchId ?? "—"}</td>
                <td className="cell-mono">{rightRow?.benchId ?? "—"}</td>
              </tr>
              <tr>
                <td>Наименование бенчмарка и версия</td>
                <td>{benchCell(leftRow)}</td>
                <td>{benchCell(rightRow)}</td>
              </tr>
              <tr>
                <td>pipeline</td>
                <td>{leftRow?.pipeline ?? "—"}</td>
                <td>{rightRow?.pipeline ?? "—"}</td>
              </tr>
              <tr>
                <td>total_tasks</td>
                <td>{leftRow?.totalTasks ?? "—"}</td>
                <td>{rightRow?.totalTasks ?? "—"}</td>
              </tr>
              <tr>
                <td>total_success</td>
                <td>{fmtNum(leftRow?.totalSuccess ?? null)}</td>
                <td>{fmtNum(rightRow?.totalSuccess ?? null)}</td>
              </tr>
              <tr>
                <td>total_failed</td>
                <td>{fmtNum(leftRow?.totalFailed ?? null)}</td>
                <td>{fmtNum(rightRow?.totalFailed ?? null)}</td>
              </tr>
              <tr>
                <td>start_time</td>
                <td>{formatIso(leftRow?.startTime ?? null)}</td>
                <td>{formatIso(rightRow?.startTime ?? null)}</td>
              </tr>
              <tr>
                <td>finish_time</td>
                <td>{formatIso(leftRow?.finishTime ?? null)}</td>
                <td>{formatIso(rightRow?.finishTime ?? null)}</td>
              </tr>
              <tr>
                <td>Время выполнения</td>
                <td>{durationBetween(leftRow?.startTime ?? null, leftRow?.finishTime ?? null)}</td>
                <td>{durationBetween(rightRow?.startTime ?? null, rightRow?.finishTime ?? null)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
