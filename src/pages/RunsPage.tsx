import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockRuns, agentVersions } from "../data/mock";
import type { RunStatus } from "../data/mock";
import { durationBetween, formatIso } from "../lib/format";

export default function RunsPage() {
  const navigate = useNavigate();
  const [agentFilter, setAgentFilter] = useState<string>("");

  const filtered = useMemo(() => {
    if (!agentFilter) return mockRuns;
    const ver =
      agentFilter.replace(/^Navigator\s+/i, "").trim() || agentFilter;
    return mockRuns.filter((r) => r.navigatorVersion === ver);
  }, [agentFilter]);

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/">Бенчмарки</Link>
        {" / "}
        <strong>Запуски</strong>
      </div>
      <h1 className="admin-page-title">Запуски</h1>
      <p className="admin-page-desc">
        История запусков с параметрами и статусом (демо).
      </p>

      <div className="admin-toolbar">
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label htmlFor="agent-filter">Версия агента</label>
          <select
            id="agent-filter"
            className="admin-input"
            style={{ minWidth: 200 }}
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
          >
            <option value="">Все</option>
            {agentVersions.map((v) => (
              <option key={v.id} value={v.label}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="admin-btn">
          Экспорт CSV
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>run_id</th>
                <th>Бенч · версия</th>
                <th>pipeline</th>
                <th>Всего</th>
                <th>Успех</th>
                <th>Ошибки</th>
                <th>Старт</th>
                <th>Финиш</th>
                <th>Длительность</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.runId}
                  className="clickable"
                  onClick={() => navigate(`/runs/${r.runId}`)}
                >
                  <td className="cell-mono">{r.runId}</td>
                  <td>
                    {r.benchName}{" "}
                    <span className="admin-pill admin-pill--warn" style={{ marginLeft: 6 }}>
                      {r.benchVersion}
                    </span>
                  </td>
                  <td>{r.pipeline}</td>
                  <td>{r.totalTasks}</td>
                  <td>{r.totalSuccess}</td>
                  <td>{r.totalFailed}</td>
                  <td>{formatIso(r.startTime)}</td>
                  <td>{formatIso(r.finishTime)}</td>
                  <td>{durationBetween(r.startTime, r.finishTime)}</td>
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
        Строка кликабельна — карточка запуска. <Link to="/compare">Сравнение →</Link>
      </p>
    </>
  );
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
