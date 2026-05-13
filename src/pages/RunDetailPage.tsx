import { Link, useParams } from "react-router-dom";
import { getRunParams, getTaskResults } from "../data/mock";
import { formatIso } from "../lib/format";

const TRACE_BASE =
  "https://admin.example.internal/traces?session_id=";

export default function RunDetailPage() {
  const { runId } = useParams();
  const id = runId ?? "";
  const params = getRunParams(id);
  const tasks = getTaskResults(id);

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/runs">Запуски</Link>
        {" / "}
        <strong className="cell-mono" style={{ display: "inline" }}>
          {id}
        </strong>
      </div>
      <h1 className="admin-page-title">Запуск {id}</h1>
      <p className="admin-page-desc">Параметры запуска и результаты тасок (демо).</p>

      <div className="admin-toolbar">
        <button type="button" className="admin-btn">
          Выгрузить JSON
        </button>
        <button type="button" className="admin-btn">
          Выгрузка Excel (TBD)
        </button>
      </div>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Комментарий</h2>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--admin-muted)" }}>
          {params.comment || "—"}
        </p>
      </div>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Параметры запуска</h2>
        <dl className="admin-meta-grid">
          <div>
            <dt>run_id</dt>
            <dd>{params.runId}</dd>
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
            <dt>planner_model / planner_version</dt>
            <dd>
              {params.plannerModel} · {params.plannerVersion}
            </dd>
          </div>
          <div>
            <dt>navigator_model / navigator_version</dt>
            <dd>
              {params.navigatorModel} · {params.navigatorVersion}
            </dd>
          </div>
          <div>
            <dt>judge_name</dt>
            <dd>{params.judgeName}</dd>
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
            <dd>{params.saveScreenshots ? "да" : "нет"}</dd>
          </div>
          <div>
            <dt>screenshots_without_markup</dt>
            <dd>{params.screenshotsWithoutMarkup ? "да" : "нет"}</dd>
          </div>
        </dl>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>task_id</th>
                <th>success</th>
                <th>duration</th>
                <th>steps</th>
                <th>judge</th>
                <th>Трейсы</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="cell-mono">{t.taskId}</td>
                  <td>
                    {t.success ? (
                      <span className="admin-pill admin-pill--ok">да</span>
                    ) : (
                      <span className="admin-pill admin-pill--bad">нет</span>
                    )}
                  </td>
                  <td>{t.durationSeconds} с</td>
                  <td>{t.numbSteps}</td>
                  <td>{t.judgeLlmResult ?? "—"}</td>
                  <td>
                    <a
                      href={`${TRACE_BASE}${encodeURIComponent(t.sessionId)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      открыть
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
