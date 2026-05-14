import type { RunRow } from "../types/run";

/** Ключ «идентичных параметров» для подбора пары и предыдущего запуска. */
export function runCompareSignature(r: RunRow): string {
  return [
    r.benchName,
    r.benchVersion,
    r.pipeline,
    r.plannerModel,
    r.plannerVersion,
    r.navigatorModel,
    r.navigatorVersion,
    r.judgeName,
    String(r.maxConcurrent),
  ].join("\u0001");
}

export function sortRunsByCreatedDesc(runs: RunRow[]): RunRow[] {
  return [...runs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

export type CompareRunFilters = {
  pipeline: string[];
  plannerModel: string[];
  plannerVersion: string[];
  navigatorModel: string[];
  navigatorVersion: string[];
  judgeName: string[];
  startFrom: string;
  startTo: string;
  finishFrom: string;
  finishTo: string;
};

export const emptyCompareFilters: CompareRunFilters = {
  pipeline: [],
  plannerModel: [],
  plannerVersion: [],
  navigatorModel: [],
  navigatorVersion: [],
  judgeName: [],
  startFrom: "",
  startTo: "",
  finishFrom: "",
  finishTo: "",
};

function dayStart(isoDate: string): string {
  return isoDate.length >= 10 ? `${isoDate.slice(0, 10)}T00:00:00.000Z` : isoDate;
}

function dayEnd(isoDate: string): string {
  return isoDate.length >= 10 ? `${isoDate.slice(0, 10)}T23:59:59.999Z` : isoDate;
}

export function filterRunsForCompare(runs: RunRow[], f: CompareRunFilters): RunRow[] {
  return runs.filter((r) => {
    if (f.pipeline.length && !f.pipeline.includes(r.pipeline)) return false;
    if (f.plannerModel.length && !f.plannerModel.includes(r.plannerModel)) return false;
    if (f.plannerVersion.length && !f.plannerVersion.includes(r.plannerVersion)) return false;
    if (f.navigatorModel.length && !f.navigatorModel.includes(r.navigatorModel)) return false;
    if (f.navigatorVersion.length && !f.navigatorVersion.includes(r.navigatorVersion)) return false;
    if (f.judgeName.length && !f.judgeName.includes(r.judgeName)) return false;
    if (f.startFrom && r.startTime && r.startTime < dayStart(f.startFrom)) return false;
    if (f.startTo && r.startTime && r.startTime > dayEnd(f.startTo)) return false;
    if (f.startFrom && !r.startTime) return false;
    if (f.startTo && !r.startTime) return false;
    if (f.finishFrom && r.finishTime && r.finishTime < dayStart(f.finishFrom)) return false;
    if (f.finishTo && r.finishTime && r.finishTime > dayEnd(f.finishTo)) return false;
    if (f.finishFrom && !r.finishTime) return false;
    if (f.finishTo && !r.finishTime) return false;
    return true;
  });
}

export function takeLatestRuns(runs: RunRow[], limit: number): RunRow[] {
  return sortRunsByCreatedDesc(runs).slice(0, limit);
}

export function defaultComparePair(runs: RunRow[]): { leftId: string; rightId: string } {
  const sorted = sortRunsByCreatedDesc(runs);
  for (const r of sorted) {
    const sig = runCompareSignature(r);
    const group = sortRunsByCreatedDesc(runs.filter((x) => runCompareSignature(x) === sig));
    if (group.length >= 2) {
      return { leftId: group[0].benchId, rightId: group[1].benchId };
    }
  }
  if (sorted.length >= 2) {
    return { leftId: sorted[0].benchId, rightId: sorted[1].benchId };
  }
  const one = sorted[0]?.benchId ?? "";
  return { leftId: one, rightId: one };
}

/** Следующий по времени (более старый) запуск с тем же ключом параметров. */
export function findPreviousSameSignature(filtered: RunRow[], selectedBenchId: string): string {
  const sel = filtered.find((x) => x.benchId === selectedBenchId);
  if (!sel) return selectedBenchId;
  const sig = runCompareSignature(sel);
  const group = sortRunsByCreatedDesc(filtered.filter((x) => runCompareSignature(x) === sig));
  const i = group.findIndex((x) => x.benchId === selectedBenchId);
  const older = group[i + 1];
  return older ? older.benchId : selectedBenchId;
}

/** Предыдущий по времени (более новый) запуск с тем же ключом параметров. */
export function findNextNewerSameSignature(filtered: RunRow[], selectedBenchId: string): string {
  const sel = filtered.find((x) => x.benchId === selectedBenchId);
  if (!sel) return selectedBenchId;
  const sig = runCompareSignature(sel);
  const group = sortRunsByCreatedDesc(filtered.filter((x) => runCompareSignature(x) === sig));
  const i = group.findIndex((x) => x.benchId === selectedBenchId);
  if (i <= 0) return selectedBenchId;
  return group[i - 1].benchId;
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function collectFilterOptions(runs: RunRow[]): {
  pipelines: string[];
  plannerModels: string[];
  plannerVersions: string[];
  navigatorModels: string[];
  navigatorVersions: string[];
  judgeNames: string[];
} {
  return {
    pipelines: uniqueSorted(runs.map((r) => r.pipeline)),
    plannerModels: uniqueSorted(runs.map((r) => r.plannerModel)),
    plannerVersions: uniqueSorted(runs.map((r) => r.plannerVersion)),
    navigatorModels: uniqueSorted(runs.map((r) => r.navigatorModel)),
    navigatorVersions: uniqueSorted(runs.map((r) => r.navigatorVersion)),
    judgeNames: uniqueSorted(runs.map((r) => r.judgeName)),
  };
}

export function runSelectLabel(r: RunRow): string {
  return `${r.benchName} · ${r.benchVersion} · №${r.runNumber}`;
}

export function compareFiltersActive(f: CompareRunFilters): boolean {
  return (
    f.pipeline.length > 0 ||
    f.plannerModel.length > 0 ||
    f.plannerVersion.length > 0 ||
    f.navigatorModel.length > 0 ||
    f.navigatorVersion.length > 0 ||
    f.judgeName.length > 0 ||
    Boolean(f.startFrom) ||
    Boolean(f.startTo) ||
    Boolean(f.finishFrom) ||
    Boolean(f.finishTo)
  );
}
