import { Link, useParams } from "react-router-dom";
import { TRACE_ADMIN_SESSION_URL } from "../config/trace";
import { useRuns } from "../context/RunsContext";
import { formatIso } from "../lib/format";

export default function TaskDetailPage() {
  const { runId, taskId } = useParams();
  const benchId = runId ?? "";
  const id = taskId ?? "";
  const { getTaskResults, getRunRow } = useRuns();
  const tasks = getTaskResults(benchId);
  const t = tasks.find((x) => x.id === id);
  const runRow = getRunRow(benchId);

  if (!t) {
    return (
      <p>
        Задача не найдена. <Link to={benchId ? `/runs/${encodeURIComponent(benchId)}` : "/runs"}>Назад</Link>
      </p>
    );
  }

  const traceHref = `${TRACE_ADMIN_SESSION_URL}${encodeURIComponent(t.sessionId)}`;

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/runs">Запуски</Link>
        {" / "}
        <Link to={`/runs/${encodeURIComponent(benchId)}`}>{benchId}</Link>
        {" / "}
        <strong>Задача</strong>
      </div>
      <h1 className="admin-page-title">Задача {t.taskId}</h1>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <a className="admin-btn admin-btn--sm" href={traceHref} target="_blank" rel="noreferrer">
          Трейс в админке (session_id)
        </a>
      </div>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Параметры задачи</h2>
        <dl className="admin-meta-grid">
          <div>
            <dt>id</dt>
            <dd className="cell-mono">{t.id}</dd>
          </div>
          <div>
            <dt>session_id</dt>
            <dd className="cell-mono">{t.sessionId}</dd>
          </div>
          <div>
            <dt>chat_id</dt>
            <dd className="cell-mono">{t.chatId}</dd>
          </div>
          <div>
            <dt>task_id</dt>
            <dd className="cell-mono">{t.taskId}</dd>
          </div>
          <div>
            <dt>task_web_name</dt>
            <dd>{t.taskWebName}</dd>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <dt>task_ques</dt>
            <dd style={{ whiteSpace: "pre-wrap" }}>{t.taskQues}</dd>
          </div>
          <div>
            <dt>task_web</dt>
            <dd className="cell-mono" style={{ wordBreak: "break-all" }}>
              {t.taskWeb}
            </dd>
          </div>
          <div>
            <dt>start_time</dt>
            <dd>{formatIso(t.startTime)}</dd>
          </div>
          <div>
            <dt>finish_time</dt>
            <dd>{formatIso(t.finishTime)}</dd>
          </div>
          <div>
            <dt>duration_seconds</dt>
            <dd>{t.durationSeconds}</dd>
          </div>
          <div>
            <dt>numb_steps</dt>
            <dd>{t.numbSteps}</dd>
          </div>
          <div>
            <dt>success</dt>
            <dd>{t.success ? "да" : "нет"}</dd>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <dt>final_answer</dt>
            <dd style={{ whiteSpace: "pre-wrap" }}>{t.finalAnswer || "—"}</dd>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <dt>judge_llm_result</dt>
            <dd style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>{t.judgeLlmResult ?? "—"}</dd>
          </div>
          <div>
            <dt>created_at</dt>
            <dd>{formatIso(t.createdAt)}</dd>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <dt>history_json_url</dt>
            <dd className="cell-mono" style={{ wordBreak: "break-all", fontSize: "0.85rem" }}>
              {t.historyJsonUrl}
            </dd>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <dt>gif_url</dt>
            <dd className="cell-mono" style={{ wordBreak: "break-all", fontSize: "0.85rem" }}>
              {t.gifUrl}
            </dd>
          </div>
        </dl>
      </div>

      <div className="admin-card admin-card-pad">
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Трейс</h2>
        <p className="admin-hint" style={{ margin: "0 0 0.75rem" }}>
          Запуск: {runRow?.benchId ?? benchId} · {runRow?.status ?? "—"}
        </p>
        <a className="admin-btn admin-btn--primary admin-btn--sm" href={traceHref} target="_blank" rel="noreferrer">
          Открыть трейс
        </a>
        {t.gifUrl.startsWith("http") ? (
          <div style={{ marginTop: "1rem" }}>
            <img src={t.gifUrl} alt="" style={{ maxWidth: "100%", borderRadius: 8 }} />
          </div>
        ) : null}
      </div>
    </>
  );
}
