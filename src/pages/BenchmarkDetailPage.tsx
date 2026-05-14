import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useBenchmarks } from "../context/BenchmarkContext";
import { useRuns } from "../context/RunsContext";
import Modal from "../components/Modal";
import Switch from "../components/Switch";
import ConfirmNewVersionModal from "../components/ConfirmNewVersionModal";
import RunLaunchModal, { type RunLaunchSubmitPayload } from "../components/RunLaunchModal";
import { sortTasksForDisplay, nextTaskIdForWeb } from "../data/initialBenchmarks";
import { formatIso } from "../lib/format";
import { tasksEqual } from "../lib/tasksEqual";
import type { BenchTask, BenchVersionData } from "../types/benchmark";

const PAGE_SIZE = 20;

function cloneTasks(tasks: BenchTask[]): BenchTask[] {
  return tasks.map((t) => ({ ...t }));
}

export default function BenchmarkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBenchmark, benchmarks, commitBenchTasks } = useBenchmarks();
  const { addRun } = useRuns();
  const bench = id ? getBenchmark(id) : undefined;

  const [viewVersionId, setViewVersionId] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [benchSaveOpen, setBenchSaveOpen] = useState(false);
  const [benchSaveMode, setBenchSaveMode] = useState<"inPlace" | "newVersion">("inPlace");

  const [formWeb, setFormWeb] = useState("");
  const [formQues, setFormQues] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [editInternalId, setEditInternalId] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [runOpen, setRunOpen] = useState(false);
  const [runScope, setRunScope] = useState<"all" | "selected">("all");

  const [workingTasks, setWorkingTasks] = useState<BenchTask[]>([]);

  const latest = bench ? bench.versions[bench.versions.length - 1] : undefined;
  const viewing: BenchVersionData | undefined = useMemo(() => {
    if (!bench || !latest) return undefined;
    if (!viewVersionId) return latest;
    return bench.versions.find((v) => v.id === viewVersionId) ?? latest;
  }, [bench, latest, viewVersionId]);

  const readOnly = Boolean(bench && viewing && latest && viewing.id !== latest.id);

  useEffect(() => {
    if (!latest) return;
    setWorkingTasks(cloneTasks(latest.tasks));
  }, [bench?.id, latest?.id]);

  const displayTasks: BenchTask[] = useMemo(() => {
    if (readOnly) {
      if (!viewing) return [];
      return sortTasksForDisplay(viewing.tasks).filter((t) => includeArchived || !t.archived);
    }
    return sortTasksForDisplay(workingTasks).filter((t) => includeArchived || !t.archived);
  }, [readOnly, viewing, workingTasks, includeArchived]);

  const dirty = useMemo(() => {
    if (!latest || readOnly) return false;
    return !tasksEqual(workingTasks, latest.tasks);
  }, [latest, readOnly, workingTasks]);

  const totalPages = Math.max(1, Math.ceil(displayTasks.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const slice = displayTasks.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE);

  const launchHandler = useCallback(
    (payload: RunLaunchSubmitPayload) => {
      const b = benchmarks.find((x) => x.id === payload.benchmarkId);
      if (!b || !id) return;
      const ver = b.versions[b.versions.length - 1];
      const sourceTasks = payload.benchmarkId === id ? workingTasks : ver.tasks;
      const active = sourceTasks.filter((t) => !t.archived);
      const sel = payload.selectedTaskInternalIds;
      const list =
        sel && sel.length ? active.filter((t) => sel.includes(t.internalId)) : active;
      const benchId = addRun({
        ...payload,
        benchmarkName: b.name,
        benchmarkVersion: ver.label,
        totalTasks: Math.max(1, list.length),
      });
      navigate(`/runs/${encodeURIComponent(benchId)}`);
    },
    [addRun, benchmarks, id, navigate, workingTasks]
  );

  if (!bench || !latest || !viewing) {
    return (
      <p>
        Бенчмарк не найден. <Link to="/">На главную</Link>
      </p>
    );
  }

  const openAdd = () => {
    setFormWeb("");
    setFormQues("");
    setFormUrl("");
    setAddOpen(true);
  };

  const openEdit = (t: BenchTask) => {
    setEditInternalId(t.internalId);
    setFormWeb(t.web_name);
    setFormQues(t.task_ques);
    setFormUrl(t.task_web);
    setEditOpen(true);
  };

  const runAddSave = () => {
    const fields = {
      web_name: formWeb.trim(),
      task_ques: formQues.trim(),
      task_web: formUrl.trim(),
    };
    if (!fields.web_name || !fields.task_ques) return;
    const task_id = nextTaskIdForWeb(workingTasks, fields.web_name);
    const newTask: BenchTask = {
      internalId: `t-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      web_name: fields.web_name,
      task_id,
      task_ques: fields.task_ques,
      task_web: fields.task_web,
      archived: false,
    };
    setWorkingTasks((prev) => [...prev, newTask]);
    setAddOpen(false);
    setPage(1);
  };

  const runEditSave = () => {
    if (!editInternalId) return;
    const fields = {
      web_name: formWeb.trim(),
      task_ques: formQues.trim(),
      task_web: formUrl.trim(),
    };
    if (!fields.web_name || !fields.task_ques) return;
    setWorkingTasks((prev) =>
      prev.map((t) => (t.internalId === editInternalId ? { ...t, ...fields } : t))
    );
    setEditOpen(false);
  };

  const archive = (t: BenchTask) => {
    if (readOnly) return;
    setWorkingTasks((prev) =>
      prev.map((x) => (x.internalId === t.internalId ? { ...x, archived: true } : x))
    );
  };

  const restore = (t: BenchTask) => {
    if (readOnly) return;
    setWorkingTasks((prev) =>
      prev.map((x) => (x.internalId === t.internalId ? { ...x, archived: false } : x))
    );
  };

  const toggleSelect = (internalId: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(internalId)) n.delete(internalId);
      else n.add(internalId);
      return n;
    });
  };

  const requestBenchSave = () => {
    if (!dirty || !id) return;
    const bump = bench!.versions.length > 1;
    setBenchSaveMode(bump ? "newVersion" : "inPlace");
    setBenchSaveOpen(true);
  };

  const applyBenchSave = () => {
    if (!id) return;
    commitBenchTasks(id, workingTasks, benchSaveMode);
    setBenchSaveOpen(false);
  };

  const versionChain = bench!.versions.map((v, idx) => (
    <span key={v.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {idx > 0 ? <span className="admin-version-arrow">→</span> : null}
      <button
        type="button"
        className={
          "admin-version-pill" + (v.id === viewing.id ? " admin-version-pill--active" : "")
        }
        onClick={() => {
          setViewVersionId(v.id === latest.id ? null : v.id);
          setPage(1);
        }}
      >
        {v.label}
      </button>
    </span>
  ));

  const benchSaveTitle =
    benchSaveMode === "newVersion" ? "Новая версия бенчмарка" : "Сохранение бенчмарка";
  const benchSaveMessage =
    benchSaveMode === "newVersion"
      ? "Внесённые изменения будут сохранены как новая версия бенчмарка. Продолжить?"
      : "Сохранить все изменения тасок в текущей версии?";

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/">Бенчмарки</Link>
        {" / "}
        <strong>{bench!.name}</strong>
      </div>

      <h1 className="admin-page-title">{bench!.name}</h1>

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <dl className="admin-meta-grid">
          <div>
            <dt>Текущая версия</dt>
            <dd>{latest.label}</dd>
          </div>
          <div>
            <dt>Количество тасок (в просмотре)</dt>
            <dd>{viewing.tasks.length}</dd>
          </div>
          <div>
            <dt>Дата и время версии</dt>
            <dd>{formatIso(viewing.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="admin-version-chain">{versionChain}</div>
      {readOnly ? (
        <p className="admin-hint">
          Просмотр версии <strong>{viewing.label}</strong> (только чтение).
        </p>
      ) : null}

      <div className="admin-toolbar admin-toolbar--split">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Switch
            id="archived"
            label="Показывать архивные таски"
            checked={includeArchived}
            onChange={(v) => {
              setIncludeArchived(v);
              setPage(1);
            }}
            disabled={readOnly}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {!readOnly ? (
            <>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                disabled={!dirty}
                onClick={requestBenchSave}
              >
                Сохранить бенчмарк
              </button>
              <button type="button" className="admin-btn admin-btn--primary" onClick={openAdd}>
                Добавить задачу
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => {
                  setRunScope("all");
                  setRunOpen(true);
                }}
              >
                Запуск всего бенча
              </button>
              <button
                type="button"
                className="admin-btn"
                disabled={selected.size === 0}
                onClick={() => {
                  setRunScope("selected");
                  setRunOpen(true);
                }}
              >
                Запуск выбранных ({selected.size})
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {!readOnly ? <th style={{ width: 40 }} /> : null}
                <th>web_name</th>
                <th>task_id</th>
                <th>task_ques</th>
                <th>task_web</th>
                {!readOnly ? <th>Действия</th> : null}
              </tr>
            </thead>
            <tbody>
              {slice.map((t) => (
                <tr key={t.internalId}>
                  {!readOnly ? (
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(t.internalId)}
                        onChange={() => toggleSelect(t.internalId)}
                        disabled={t.archived}
                        aria-label="Выбрать для запуска"
                      />
                    </td>
                  ) : null}
                  <td>{t.web_name}</td>
                  <td className="cell-mono" title={t.task_id}>
                    {t.task_id}
                  </td>
                  <td className="cell-wrap" title={t.task_ques}>
                    {t.task_ques}
                  </td>
                  <td className="cell-mono" title={t.task_web || "—"}>
                    {t.task_web || "—"}
                  </td>
                  {!readOnly ? (
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm"
                        onClick={() => openEdit(t)}
                      >
                        Изменить
                      </button>{" "}
                      {!t.archived ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          onClick={() => archive(t)}
                        >
                          В архив
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm"
                          onClick={() => restore(t)}
                        >
                          Восстановить
                        </button>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={"admin-page-btn" + (p === pageClamped ? " admin-page-btn--active" : "")}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <Modal
        title="Новая задача"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setAddOpen(false)}>
              Отмена
            </button>
            <button type="button" className="admin-btn admin-btn--primary" onClick={runAddSave}>
              Сохранить
            </button>
          </>
        }
      >
        <p className="admin-hint">
          Поле <strong>task_id</strong> формируется автоматически по <code>web_name</code>. Чтобы
          зафиксировать изменения в бенчмарке для других пользователей, нажмите «Сохранить бенчмарк».
        </p>
        <div className="admin-field">
          <label htmlFor="add-web">web_name</label>
          <input
            id="add-web"
            className="admin-input"
            value={formWeb}
            onChange={(e) => setFormWeb(e.target.value)}
            placeholder="Amazon"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="add-ques">task_ques</label>
          <textarea
            id="add-ques"
            className="admin-input"
            value={formQues}
            onChange={(e) => setFormQues(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="add-url">task_web</label>
          <input
            id="add-url"
            className="admin-input"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
      </Modal>

      <Modal
        title="Изменить задачу"
        open={editOpen}
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setEditOpen(false)}>
              Отмена
            </button>
            <button type="button" className="admin-btn admin-btn--primary" onClick={runEditSave}>
              Сохранить
            </button>
          </>
        }
      >
        <p className="admin-hint" style={{ marginTop: 0 }}>
          Изменения попадут в черновик карточки. Итоговая запись в бенчмарк — кнопка «Сохранить бенчмарк».
        </p>
        <div className="admin-field">
          <label htmlFor="edit-web">web_name</label>
          <input
            id="edit-web"
            className="admin-input"
            value={formWeb}
            onChange={(e) => setFormWeb(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="edit-ques">task_ques</label>
          <textarea
            id="edit-ques"
            className="admin-input"
            value={formQues}
            onChange={(e) => setFormQues(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="edit-url">task_web</label>
          <input
            id="edit-url"
            className="admin-input"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />
        </div>
      </Modal>

      <ConfirmNewVersionModal
        open={benchSaveOpen}
        title={benchSaveTitle}
        message={benchSaveMessage}
        onCancel={() => setBenchSaveOpen(false)}
        onConfirm={applyBenchSave}
      />

      <RunLaunchModal
        open={runOpen}
        onClose={() => setRunOpen(false)}
        benchmarks={benchmarks}
        defaultBenchmarkId={bench!.id}
        lockedBenchmarkId={bench!.id}
        selectedTaskIds={
          runScope === "selected" && selected.size ? Array.from(selected) : null
        }
        title={runScope === "selected" ? "Запуск выбранных тасок" : "Запуск бенчмарка"}
        onSubmit={launchHandler}
      />
    </>
  );
}
