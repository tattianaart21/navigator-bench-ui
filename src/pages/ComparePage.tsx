import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRuns } from "../context/RunsContext";
import { durationBetween, formatIso } from "../lib/format";

export default function ComparePage() {
  const { runs } = useRuns();
  const [leftId, setLeftId] = useState(runs[2]?.benchId ?? "");
  const [rightId, setRightId] = useState(runs[0]?.benchId ?? "");

  const left = runs.find((r) => r.benchId === leftId);
  const right = runs.find((r) => r.benchId === rightId);

  const metrics = useMemo(() => {
    if (!left || !right) return null;
    const lr =
      left.totalTasks > 0 && left.totalSuccess != null
        ? (left.totalSuccess / left.totalTasks) * 100
        : 0;
    const rr =
      right.totalTasks > 0 && right.totalSuccess != null
        ? (right.totalSuccess / right.totalTasks) * 100
        : 0;
    const li =
      left.totalTasks > 0 && left.totalFailed != null
        ? (left.totalFailed / left.totalTasks) * 100
        : 0;
    const ri =
      right.totalTasks > 0 && right.totalFailed != null
        ? (right.totalFailed / right.totalTasks) * 100
        : 0;
    return {
      durationLeft: durationBetween(left.startTime, left.finishTime),
      durationRight: durationBetween(right.startTime, right.finishTime),
      successLeft: lr.toFixed(1),
      successRight: rr.toFixed(1),
      failLeft: li.toFixed(1),
      failRight: ri.toFixed(1),
    };
  }, [left, right]);

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/">Бенчмарки</Link>
        {" / "}
        <strong>Сравнение</strong>
      </div>
      <h1 className="admin-page-title">Сравнение запусков</h1>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Выбор запусков</h2>
        <div className="admin-form-grid" style={{ marginBottom: "1rem" }}>
          <div className="admin-field">
            <label htmlFor="run-a">Запуск A</label>
            <select
              id="run-a"
              className="admin-input"
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
            >
              {runs.map((r) => (
                <option key={r.benchId} value={r.benchId}>
                  {r.benchId} · {r.benchName} ({r.benchVersion})
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="run-b">Запуск B</label>
            <select
              id="run-b"
              className="admin-input"
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
            >
              {runs.map((r) => (
                <option key={`b-${r.benchId}`} value={r.benchId}>
                  {r.benchId} · {r.benchName} ({r.benchVersion})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {left && right && metrics && (
        <div className="admin-compare-grid">
          <div className="admin-card admin-card-pad">
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>{left.benchId}</h2>
            <dl className="admin-meta-grid">
              <div>
                <dt>Бенч · версия</dt>
                <dd>
                  {left.benchName} {left.benchVersion}
                </dd>
              </div>
              <div>
                <dt>Старт — финиш</dt>
                <dd>
                  {formatIso(left.startTime)} — {formatIso(left.finishTime)}
                </dd>
              </div>
              <div>
                <dt>Длительность</dt>
                <dd>{metrics.durationLeft}</dd>
              </div>
              <div>
                <dt>Success rate</dt>
                <dd>{metrics.successLeft}%</dd>
              </div>
              <div>
                <dt>Fail rate</dt>
                <dd>{metrics.failLeft}%</dd>
              </div>
              <div>
                <dt>navigator</dt>
                <dd>{left.navigatorVersion}</dd>
              </div>
            </dl>
          </div>
          <div className="admin-card admin-card-pad">
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>{right.benchId}</h2>
            <dl className="admin-meta-grid">
              <div>
                <dt>Бенч · версия</dt>
                <dd>
                  {right.benchName} {right.benchVersion}
                </dd>
              </div>
              <div>
                <dt>Старт — финиш</dt>
                <dd>
                  {formatIso(right.startTime)} — {formatIso(right.finishTime)}
                </dd>
              </div>
              <div>
                <dt>Длительность</dt>
                <dd>{metrics.durationRight}</dd>
              </div>
              <div>
                <dt>Success rate</dt>
                <dd>{metrics.successRight}%</dd>
              </div>
              <div>
                <dt>Fail rate</dt>
                <dd>{metrics.failRight}%</dd>
              </div>
              <div>
                <dt>navigator</dt>
                <dd>{right.navigatorVersion}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
