import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { clonePayload } from "../data/defaultConfigPayload";
import { getActiveConfigVersion, useConfigs } from "../context/ConfigContext";
import ConfigPayloadForm from "../components/ConfigPayloadForm";
import ConfirmNewVersionModal from "../components/ConfirmNewVersionModal";
import Modal from "../components/Modal";
import type { ConfigPayload } from "../types/config";
import { formatIso } from "../lib/format";

const VERSION_MSG = "Будет создана новая версия конфига. Продолжить?";

export default function ConfigDetailPage() {
  const { id } = useParams();
  const {
    getConfig,
    updateConfigMeta,
    deleteConfig,
    restoreConfig,
    createConfigVersion,
    activateVersion,
  } = useConfigs();
  const config = id ? getConfig(id) : undefined;

  const [viewVersionId, setViewVersionId] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<"form" | "json">("form");
  const [draftPayload, setDraftPayload] = useState<ConfigPayload | null>(null);
  const [draftJson, setDraftJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [versionDesc, setVersionDesc] = useState("");

  const [metaOpen, setMetaOpen] = useState(false);
  const [metaName, setMetaName] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | (() => void)>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const active = config ? getActiveConfigVersion(config) : undefined;
  const latest = config ? config.versions[config.versions.length - 1] : undefined;

  const viewing = useMemo(() => {
    if (!config || !latest) return undefined;
    if (!viewVersionId) return active ?? latest;
    return config.versions.find((v) => v.id === viewVersionId) ?? latest;
  }, [config, latest, active, viewVersionId]);

  const readOnly = Boolean(config && viewing && active && viewing.id !== active.id);
  const isActiveView = Boolean(viewing && active && viewing.id === active.id);

  useEffect(() => {
    if (!viewing) return;
    setDraftPayload(clonePayload(viewing.payload));
    setDraftJson(JSON.stringify(viewing.payload, null, 2));
    setJsonError(null);
    setVersionDesc("");
  }, [viewing?.id]);

  if (!config || !latest || !viewing || !draftPayload) {
    return (
      <p>
        Конфиг не найден. <Link to="/configs">К списку</Link>
      </p>
    );
  }

  const requestConfirm = (fn: () => void) => {
    setConfirmAction(() => fn);
    setConfirmOpen(true);
  };

  const syncJsonFromForm = () => {
    setDraftJson(JSON.stringify(draftPayload, null, 2));
    setJsonError(null);
  };

  const applyJsonToForm = (): boolean => {
    try {
      const parsed = JSON.parse(draftJson) as ConfigPayload;
      setDraftPayload(parsed);
      setJsonError(null);
      return true;
    } catch {
      setJsonError("Некорректный JSON");
      return false;
    }
  };

  const saveNewVersion = () => {
    if (readOnly || !id) return;
    let payload = draftPayload;
    if (editorTab === "json") {
      if (!applyJsonToForm()) return;
      try {
        payload = JSON.parse(draftJson) as ConfigPayload;
      } catch {
        return;
      }
    }
    requestConfirm(() => {
      createConfigVersion(id, {
        description: versionDesc,
        payload,
        basedOnVersionId: viewing.id,
      });
      setViewVersionId(null);
    });
  };

  const openMeta = () => {
    setMetaName(config.name);
    setMetaDesc(config.description);
    setMetaOpen(true);
  };

  const versionChain = config.versions.map((v, idx) => (
    <span key={v.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {idx > 0 ? <span className="admin-version-arrow">→</span> : null}
      <button
        type="button"
        className={
          "admin-version-pill" +
          (v.id === viewing.id ? " admin-version-pill--active" : "") +
          (v.id === config.activeVersionId ? " admin-version-pill--current" : "")
        }
        onClick={() => setViewVersionId(v.id === active?.id ? null : v.id)}
      >
        {v.label}
        {v.id === config.activeVersionId ? " ★" : ""}
      </button>
    </span>
  ));

  return (
    <>
      <div className="admin-breadcrumb">
        <Link to="/configs">Конфиги</Link>
        {" / "}
        <strong>{config.name}</strong>
      </div>

      <h1 className="admin-page-title">{config.name}</h1>
      <p className="admin-page-desc">{config.description || "Без описания"}</p>

      {config.deleted ? (
        <div className="admin-banner admin-banner--warn">
          Конфиг помечен как удалённый.{" "}
          <button type="button" className="admin-btn admin-btn--sm" onClick={() => restoreConfig(config.id)}>
            Восстановить
          </button>
        </div>
      ) : null}

      <div className="admin-card admin-card-pad" style={{ marginBottom: "1rem" }}>
        <dl className="admin-meta-grid">
          <div>
            <dt>Активная версия</dt>
            <dd>{active?.label ?? "—"}</dd>
          </div>
          <div>
            <dt>Просмотр</dt>
            <dd>
              {viewing.label}
              {isActiveView ? " (активная)" : " (только чтение)"}
            </dd>
          </div>
          <div>
            <dt>Дата версии</dt>
            <dd>{formatIso(viewing.createdAt)}</dd>
          </div>
          <div>
            <dt>Комментарий версии</dt>
            <dd>{viewing.description || "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="admin-version-chain">{versionChain}</div>

      <div className="admin-toolbar admin-toolbar--split">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="admin-btn" onClick={openMeta}>
            Изменить имя
          </button>
          {readOnly && active ? (
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => activateVersion(config.id, viewing.id)}
            >
              Сделать активной
            </button>
          ) : null}
          {!config.deleted ? (
            <button type="button" className="admin-btn admin-btn--danger" onClick={() => setDeleteOpen(true)}>
              Удалить конфиг
            </button>
          ) : null}
        </div>
        {!readOnly ? (
          <button type="button" className="admin-btn admin-btn--primary" onClick={saveNewVersion}>
            Сохранить как новую версию
          </button>
        ) : null}
      </div>

      <div className="admin-card admin-card-pad">
        <div className="admin-tab-bar" role="tablist">
          <button
            type="button"
            role="tab"
            className={"admin-tab-btn" + (editorTab === "form" ? " admin-tab-btn--active" : "")}
            onClick={() => {
              if (editorTab === "json") applyJsonToForm();
              setEditorTab("form");
            }}
          >
            Форма
          </button>
          <button
            type="button"
            role="tab"
            className={"admin-tab-btn" + (editorTab === "json" ? " admin-tab-btn--active" : "")}
            onClick={() => {
              syncJsonFromForm();
              setEditorTab("json");
            }}
          >
            JSON
          </button>
        </div>

        {!readOnly ? (
          <div className="admin-field" style={{ marginTop: "1rem" }}>
            <label htmlFor="ver-desc">Комментарий к новой версии</label>
            <input
              id="ver-desc"
              className="admin-input"
              value={versionDesc}
              onChange={(e) => setVersionDesc(e.target.value)}
              placeholder="Например: увеличен max_steps"
            />
          </div>
        ) : null}

        {editorTab === "form" ? (
          <div style={{ marginTop: "1rem" }}>
            <ConfigPayloadForm
              payload={draftPayload}
              onChange={setDraftPayload}
              disabled={readOnly}
            />
          </div>
        ) : (
          <div style={{ marginTop: "1rem" }}>
            <textarea
              className="admin-input admin-json-editor"
              rows={18}
              readOnly={readOnly}
              value={draftJson}
              onChange={(e) => {
                setDraftJson(e.target.value);
                setJsonError(null);
              }}
              spellCheck={false}
            />
            {jsonError ? <p className="admin-error-text">{jsonError}</p> : null}
          </div>
        )}
      </div>

      <Modal
        title="Имя и описание"
        open={metaOpen}
        onClose={() => setMetaOpen(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setMetaOpen(false)}>
              Отмена
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => {
                updateConfigMeta(config.id, { name: metaName, description: metaDesc });
                setMetaOpen(false);
              }}
            >
              Сохранить
            </button>
          </>
        }
      >
        <div className="admin-field">
          <label htmlFor="meta-name">Название</label>
          <input
            id="meta-name"
            className="admin-input"
            value={metaName}
            onChange={(e) => setMetaName(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="meta-desc">Описание</label>
          <textarea
            id="meta-desc"
            className="admin-input"
            rows={3}
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        title="Удалить конфиг?"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setDeleteOpen(false)}>
              Отмена
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={() => {
                deleteConfig(config.id);
                setDeleteOpen(false);
              }}
            >
              Удалить
            </button>
          </>
        }
      >
        <p className="admin-modal-text">Конфиг будет скрыт из списка (soft delete). Версии сохраняются.</p>
      </Modal>

      <ConfirmNewVersionModal
        open={confirmOpen}
        title="Новая версия конфига"
        message={VERSION_MSG}
        onConfirm={() => {
          confirmAction?.();
          setConfirmOpen(false);
          setConfirmAction(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
        }}
      />
    </>
  );
}
