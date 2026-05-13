import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBenchmarks } from "../context/BenchmarkContext";
import Modal from "../components/Modal";
import RunLaunchModal from "../components/RunLaunchModal";
import { formatIso } from "../lib/format";

export default function BenchmarksPage() {
  const { benchmarks, createBenchmark } = useBenchmarks();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [runOpen, setRunOpen] = useState(false);
  const [defaultBench, setDefaultBench] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      benchmarks.map((b) => {
        const v = b.versions[b.versions.length - 1];
        return {
          id: b.id,
          name: b.name,
          version: v.label,
          taskCount: v.tasks.length,
          createdAt: v.createdAt,
        };
      }),
    [benchmarks]
  );

  const submitCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createBenchmark(name);
    setCreateOpen(false);
    setNewName("");
    navigate(`/bench/${id}`);
  };

  return (
    <>
      <h1 className="admin-page-title">Бенчмарки</h1>
      <p className="admin-page-desc">
        Список бенчмарков с актуальной версией. Прототип UI — данные локальные.
      </p>

      <div className="admin-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setRunOpen(true)}>
          Запуск
        </button>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setCreateOpen(true)}>
          Создать
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Текущая версия</th>
                <th>Количество тасок</th>
                <th>Дата и время версии</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="clickable" onClick={() => navigate(`/bench/${r.id}`)}>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td>{r.version}</td>
                  <td>{r.taskCount}</td>
                  <td>{formatIso(r.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn--sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDefaultBench(r.id);
                        setRunOpen(true);
                      }}
                    >
                      Запуск
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title="Новый бенчмарк"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setCreateOpen(false)}>
              Отмена
            </button>
            <button type="button" className="admin-btn admin-btn--primary" onClick={submitCreate}>
              Далее
            </button>
          </>
        }
      >
        <div className="admin-field">
          <label htmlFor="bench-name">Название бенчмарка</label>
          <input
            id="bench-name"
            className="admin-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Например, E-commerce навигация"
          />
        </div>
        <p className="admin-hint" style={{ marginBottom: 0 }}>
          После создания откроется карточка: добавьте таски кнопкой «Добавить задачу» — версия{" "}
          <strong>v1</strong>.
        </p>
      </Modal>

      <RunLaunchModal
        open={runOpen}
        onClose={() => {
          setRunOpen(false);
          setDefaultBench(null);
        }}
        benchmarks={benchmarks}
        defaultBenchmarkId={defaultBench}
        onSubmit={() => {
          /* мок */
        }}
      />

      <p className="admin-hint" style={{ marginTop: "1.25rem" }}>
        Связанные разделы: <Link to="/runs">запуски</Link>, <Link to="/compare">сравнение</Link>.
      </p>
    </>
  );
}
