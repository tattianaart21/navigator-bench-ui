import { Link, useNavigate, useParams } from "react-router-dom";
import { TRACE_ADMIN_SESSION_URL } from "../config/trace";
import { useRuns } from "../context/RunsContext";
import { formatIso } from "../lib/format";
import type { TaskResult } from "../types/run";
import Switch from "../components/Switch";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function TraceCard({ sessionId }: { sessionId: string }) {
  const href = `${TRACE_ADMIN_SESSION_URL}${encodeURIComponent(sessionId)}`;
  return (
    <div className="admin-trace-card">
      <span className="admin-trace-card-label">trace</span>
      <span className="cell-mono admin-trace-card-sid">{sessionId}</span>
      <a className="admin-btn admin-btn--sm" href={href} target="_blank" rel="noreferrer">
        trace
      </a>
    </div>
  );
}

export default function RunDetailPage() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const benchId = runId ?? "";
  const { getRunParams, getTaskResults, getRunRow, cancelRun } = useRuns();
  const params = getRunParams(benchId);
  const tasks = getTaskResults(benchId);
  const row = getRunRow(benchId);

  const jsonPayload = { parameters: params, tasks };

  const goTask = (t: TaskResult) => {
    navigate(`/runs/${encodeURIComponent(benchId)}/task/${encodeURIComponent(t.id)}`);
  };

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/runs">Запуски</Link>
        {" / "}
        <strong className="cell-mono" style={{ display: "inline" }}>
          {benchId}
        </strong>
      </div>
      <h1 className="admin-page-title">Запуск {benchId}</h1>

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn"
          onClick={() => downloadJson(`${benchId}-bench.json`, jsonPayload)}
        >
          Скачать JSON
        </button>
        {row?.status === "В работе" ? (
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={() => cancelRun(benchId)}
          >
            Завершить выполнение
          </button>
        ) : null}
      </div>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Параметры запуска</h2>
        <dl className="admin-meta-grid">
          <div>
            <dt>Id</dt>
            <dd className="cell-mono">{params.benchId}</dd>
          </div>
          <div>
            <dt>start_time</dt>
            <dd>{formatIso(params.startTime)}</dd>
          </div>
          <div>
            <dt>finish_time</dt>
            <dd>{formatIso(params.finishTime)}</dd>
          </div>
          <div>
            <dt>web_browser_path</dt>
            <dd className="cell-mono" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
              {params.webBrowserPath}
            </dd>
          </div>
          <div>
            <dt>web_browser_extension_dir</dt>
            <dd className="cell-mono" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
              {params.webBrowserExtensionDir}
            </dd>
          </div>
          <div>
            <dt>web_browser_user_dir</dt>
            <dd className="cell-mono" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
              {params.webBrowserUserDir}
            </dd>
          </div>
          <div>
            <dt>pipeline</dt>
            <dd>{params.pipeline}</dd>
          </div>
          <div>
            <dt>max_steps</dt>
            <dd>{params.maxSteps}</dd>
          </div>
          <div>
            <dt>max_concurrent</dt>
            <dd>{params.maxConcurrent}</dd>
          </div>
          <div>
            <dt>planner_model</dt>
            <dd>{params.plannerModel}</dd>
          </div>
          <div>
            <dt>planner_version</dt>
            <dd>{params.plannerVersion}</dd>
          </div>
          <div>
            <dt>navigator_model</dt>
            <dd>{params.navigatorModel}</dd>
          </div>
          <div>
            <dt>navigator_version</dt>
            <dd>{params.navigatorVersion}</dd>
          </div>
          <div>
            <dt>judge_name</dt>
            <dd>{params.judgeName}</dd>
          </div>
          <div>
            <dt>result_dir</dt>
            <dd>{params.resultDir}</dd>
          </div>
          <div>
            <dt>bench_test_path</dt>
            <dd>{params.benchTestPath}</dd>
          </div>
          <div>
            <dt>gigado_backend_url</dt>
            <dd>{params.gigadoBackendUrl}</dd>
          </div>
          <div>
            <dt>user_id</dt>
            <dd>{params.userId}</dd>
          </div>
          <div>
            <dt>run_number</dt>
            <dd>{params.runNumber}</dd>
          </div>
          <div>
            <dt>kubernetes_pod_id</dt>
            <dd>{params.kubernetesPodId}</dd>
          </div>
          <div>
            <dt>created_at</dt>
            <dd>{formatIso(params.createdAt)}</dd>
          </div>
          <div>
            <dt>save_screenshots</dt>
            <dd>
              <Switch checked={params.saveScreenshots} onChange={() => {}} disabled />
            </dd>
          </div>
          <div>
            <dt>screenshots_without_markup</dt>
            <dd>
              <Switch checked={params.screenshotsWithoutMarkup} onChange={() => {}} disabled />
            </dd>
          </div>
        </dl>
      </div>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Таски запуска</h2>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>task_id</th>
                <th>task_ques</th>
                <th>duration_seconds</th>
                <th>numb_steps</th>
                <th>success</th>
                <th>trace</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="cell-mono">
                    <button type="button" className="admin-link-btn" onClick={() => goTask(t)}>
                      {t.taskId}
                    </button>
                  </td>
                  <td className="cell-wrap" style={{ maxWidth: 280 }}>
                    <button type="button" className="admin-link-btn admin-link-btn--block" onClick={() => goTask(t)}>
                      {t.taskQues}
                    </button>
                  </td>
                  <td>{t.durationSeconds}</td>
                  <td>{t.numbSteps}</td>
                  <td>
                    {t.success ? (
                      <span className="admin-pill admin-pill--ok">да</span>
                    ) : (
                      <span className="admin-pill admin-pill--bad">нет</span>
                    )}
                  </td>
                  <td>
                    <TraceCard sessionId={t.sessionId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tasks.length === 0 ? (
          <p className="admin-hint" style={{ padding: "1rem 1.25rem", margin: 0 }}>
            Таски появятся по мере выполнения или после завершения запуска.
          </p>
        ) : null}
      </div>
    </>
  );
}
