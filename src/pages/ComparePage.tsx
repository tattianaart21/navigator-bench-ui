import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { mockRuns } from "../data/mock";
import { durationBetween, formatIso } from "../lib/format";

export default function ComparePage() {
  const [leftId, setLeftId] = useState(mockRuns[2]?.runId ?? "");
  const [rightId, setRightId] = useState(mockRuns[0]?.runId ?? "");

  const left = mockRuns.find((r) => r.runId === leftId);
  const right = mockRuns.find((r) => r.runId === rightId);

  const metrics = useMemo(() => {
    if (!left || !right) return null;
    const lr =
      left.totalTasks > 0 ? (left.totalSuccess / left.totalTasks) * 100 : 0;
    const rr =
      right.totalTasks > 0 ? (right.totalSuccess / right.totalTasks) * 100 : 0;
    const li =
      left.totalTasks > 0 ? (left.totalFailed / left.totalTasks) * 100 : 0;
    const ri =
      right.totalTasks > 0 ? (right.totalFailed / right.totalTasks) * 100 : 0;
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
      <p className="admin-page-desc">
        Выбор двух запусков и агрегированные метрики (без diff по таскам в MVP).
      </p>

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
              {mockRuns.map((r) => (
                <option key={r.runId} value={r.runId}>
                  {r.runId} · {r.benchName} ({r.benchVersion})
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
              {mockRuns.map((r) => (
                <option key={`b-${r.runId}`} value={r.runId}>
                  {r.runId} · {r.benchName} ({r.benchVersion})
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="admin-hint" style={{ margin: 0 }}>
          В продукте можно предлагать пару «последний vs предыдущий» при совпадении конфигурации.
        </p>
      </div>

      {left && right && metrics && (
        <div className="admin-compare-grid">
          <div className="admin-card admin-card-pad">
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>{left.runId}</h2>
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
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>{right.runId}</h2>
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
