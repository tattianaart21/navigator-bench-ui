import { clonePayload, DEFAULT_CONFIG_PAYLOAD } from "./defaultConfigPayload";
import type { ConfigData, ConfigVersionData } from "../types/config";

function version(
  id: string,
  num: number,
  description: string,
  createdAt: string,
  payload: typeof DEFAULT_CONFIG_PAYLOAD,
  parent: string | null
): ConfigVersionData {
  return {
    id,
    version: num,
    label: `v${num}`,
    description,
    createdAt,
    payload: clonePayload(payload),
    parentVersionId: parent,
  };
}

export function buildInitialConfigs(): ConfigData[] {
  const payloadA = clonePayload(DEFAULT_CONFIG_PAYLOAD);
  const payloadB = {
    ...clonePayload(DEFAULT_CONFIG_PAYLOAD),
    pipeline: "navigator_only",
    navigator_version: "1.1.4",
    max_concurrent: 4,
  };

  const c1v1 = version("c1v1", 1, "Базовый full stack", "2026-04-01T10:00:00Z", payloadA, null);
  const c1v2 = version(
    "c1v2",
    2,
    "Увеличен max_steps",
    "2026-04-15T14:00:00Z",
    { ...payloadA, max_steps: 60 },
    c1v1.id
  );
  const c1v3 = version(
    "c1v3",
    3,
    "Текущий production",
    "2026-05-10T09:00:00Z",
    { ...payloadA, judge_name: "judge-llm-v2" },
    c1v2.id
  );

  const c2v1 = version("c2v1", 1, "Navigator only", "2026-05-01T12:00:00Z", payloadB, null);

  return [
    {
      id: "c1",
      name: "Production eval",
      description: "Основной конфиг для прогонов e-commerce бенчей",
      activeVersionId: c1v3.id,
      versions: [c1v1, c1v2, c1v3],
    },
    {
      id: "c2",
      name: "Navigator smoke",
      description: "Быстрые прогоны только навигатора",
      activeVersionId: c2v1.id,
      versions: [c2v1],
    },
  ];
}
