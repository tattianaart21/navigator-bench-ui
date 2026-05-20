import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveConfigVersion, useConfigs } from "../context/ConfigContext";
import Modal from "../components/Modal";
import Switch from "../components/Switch";
import { formatIso } from "../lib/format";

export default function ConfigsPage() {
  const { configs, createConfig } = useConfigs();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return configs
      .filter((c) => includeDeleted || !c.deleted)
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
      .map((c) => {
        const v = getActiveConfigVersion(c);
        return {
          id: c.id,
          name: c.name,
          description: c.description,
          version: v.label,
          versionCreatedAt: v.createdAt,
          deleted: Boolean(c.deleted),
        };
      });
  }, [configs, includeDeleted, search]);

  const submitCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createConfig(name, newDesc.trim());
    setCreateOpen(false);
    setNewName("");
    setNewDesc("");
    navigate(`/configs/${id}`);
  };

  return (
    <>
      <h1 className="admin-page-title">Конфиги</h1>
      <p className="admin-page-desc">
        Параметры запуска бенчмарков (pipeline, модели, браузер). Версии immutable — правки создают
        новую версию. Прототип: данные локальные, API orchestrator <code>/configs/</code>.
      </p>

      <div className="admin-toolbar admin-toolbar--split">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div className="admin-field" style={{ marginBottom: 0, minWidth: 220 }}>
            <label htmlFor="cfg-search">Поиск</label>
            <input
              id="cfg-search"
              className="admin-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Имя или описание"
            />
          </div>
          <Switch
            id="cfg-deleted"
            label="Показать удалённые"
            checked={includeDeleted}
            onChange={setIncludeDeleted}
          />
        </div>
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
                <th>Активная версия</th>
                <th>Описание</th>
                <th>Дата версии</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--admin-muted)" }}>
                    Конфигов не найдено
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className={"clickable" + (r.deleted ? " admin-row--muted" : "")}
                    onClick={() => navigate(`/configs/${r.id}`)}
                  >
                    <td>
                      <strong>{r.name}</strong>
                      {r.deleted ? (
                        <span className="admin-pill" style={{ marginLeft: 8 }}>
                          Удалён
                        </span>
                      ) : null}
                    </td>
                    <td>{r.version}</td>
                    <td className="cell-ellipsis" title={r.description}>
                      {r.description || "—"}
                    </td>
                    <td>{formatIso(r.versionCreatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title="Новый конфиг"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setCreateOpen(false)}>
              Отмена
            </button>
            <button type="button" className="admin-btn admin-btn--primary" onClick={submitCreate}>
              Создать
            </button>
          </>
        }
      >
        <div className="admin-field">
          <label htmlFor="cfg-name">Название</label>
          <input
            id="cfg-name"
            className="admin-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Production eval"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="cfg-desc">Описание</label>
          <textarea
            id="cfg-desc"
            className="admin-input"
            rows={3}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Для чего используется конфиг"
          />
        </div>
        <p className="admin-hint" style={{ marginBottom: 0 }}>
          Будет создана версия <strong>v1</strong> с параметрами по умолчанию.
        </p>
      </Modal>

      <p className="admin-hint" style={{ marginTop: "1.25rem" }}>
        При запуске бенча выберите конфиг в модалке «Запуск». См. также{" "}
        <Link to="/runs">запуски</Link>.
      </p>
    </>
  );
}
