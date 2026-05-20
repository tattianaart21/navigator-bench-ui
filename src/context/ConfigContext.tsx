import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildInitialConfigs } from "../data/initialConfigs";
import { clonePayload, DEFAULT_CONFIG_PAYLOAD } from "../data/defaultConfigPayload";
import type { ConfigData, ConfigPayload, ConfigVersionData } from "../types/config";

function activeVersion(cfg: ConfigData): ConfigVersionData | undefined {
  return cfg.versions.find((v) => v.id === cfg.activeVersionId) ?? cfg.versions[cfg.versions.length - 1];
}

function latestVersion(cfg: ConfigData): ConfigVersionData {
  return cfg.versions[cfg.versions.length - 1];
}

type Ctx = {
  configs: ConfigData[];
  getConfig: (id: string) => ConfigData | undefined;
  createConfig: (name: string, description: string) => string;
  updateConfigMeta: (id: string, fields: { name?: string; description?: string }) => void;
  deleteConfig: (id: string) => void;
  restoreConfig: (id: string) => void;
  createConfigVersion: (
    configId: string,
    fields: { description: string; payload: ConfigPayload; basedOnVersionId: string }
  ) => void;
  activateVersion: (configId: string, versionId: string) => void;
};

const ConfigContext = createContext<Ctx | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<ConfigData[]>(buildInitialConfigs);

  const getConfig = useCallback((id: string) => configs.find((c) => c.id === id), [configs]);

  const createConfig = useCallback((name: string, description: string) => {
    const id = `c${Date.now()}`;
    const v1: ConfigVersionData = {
      id: `${id}v1`,
      version: 1,
      label: "v1",
      description: "Начальная версия",
      createdAt: new Date().toISOString(),
      payload: clonePayload(DEFAULT_CONFIG_PAYLOAD),
      parentVersionId: null,
    };
    setConfigs((prev) => [
      ...prev,
      {
        id,
        name,
        description,
        activeVersionId: v1.id,
        versions: [v1],
      },
    ]);
    return id;
  }, []);

  const updateConfigMeta = useCallback(
    (id: string, fields: { name?: string; description?: string }) => {
      setConfigs((prev) =>
        prev.map((c) =>
          c.id !== id
            ? c
            : {
                ...c,
                name: fields.name?.trim() ? fields.name.trim() : c.name,
                description: fields.description !== undefined ? fields.description : c.description,
              }
        )
      );
    },
    []
  );

  const deleteConfig = useCallback((id: string) => {
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, deleted: true } : c)));
  }, []);

  const restoreConfig = useCallback((id: string) => {
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, deleted: false } : c)));
  }, []);

  const createConfigVersion = useCallback(
    (
      configId: string,
      fields: { description: string; payload: ConfigPayload; basedOnVersionId: string }
    ) => {
      setConfigs((prev) =>
        prev.map((c) => {
          if (c.id !== configId) return c;
          const base = c.versions.find((v) => v.id === fields.basedOnVersionId) ?? latestVersion(c);
          const nextNum = latestVersion(c).version + 1;
          const newV: ConfigVersionData = {
            id: `${configId}v${nextNum}`,
            version: nextNum,
            label: `v${nextNum}`,
            description: fields.description.trim() || `Версия ${nextNum}`,
            createdAt: new Date().toISOString(),
            payload: clonePayload(fields.payload),
            parentVersionId: base.id,
          };
          return {
            ...c,
            activeVersionId: newV.id,
            versions: [...c.versions, newV],
          };
        })
      );
    },
    []
  );

  const activateVersion = useCallback((configId: string, versionId: string) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === configId && c.versions.some((v) => v.id === versionId)
          ? { ...c, activeVersionId: versionId }
          : c
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      configs,
      getConfig,
      createConfig,
      updateConfigMeta,
      deleteConfig,
      restoreConfig,
      createConfigVersion,
      activateVersion,
    }),
    [
      configs,
      getConfig,
      createConfig,
      updateConfigMeta,
      deleteConfig,
      restoreConfig,
      createConfigVersion,
      activateVersion,
    ]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfigs() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfigs must be used within ConfigProvider");
  return ctx;
}

export function getActiveConfigVersion(cfg: ConfigData): ConfigVersionData {
  return activeVersion(cfg) ?? latestVersion(cfg);
}
