import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RunLaunchForm, RunLaunchSubmitPayload } from "../components/RunLaunchModal";
import {
  buildDemoTasks,
  seedParamsByBenchId,
  seedRunRows,
  seedTasksByBenchId,
} from "../data/runSeed";
import type { RunParams, RunRow, TaskResult } from "../types/run";

type LaunchPayload = RunLaunchSubmitPayload & {
  benchmarkName: string;
  benchmarkVersion: string;
  totalTasks: number;
};

type Ctx = {
  runs: RunRow[];
  getRunRow: (benchId: string) => RunRow | undefined;
  getRunParams: (benchId: string) => RunParams;
  getTaskResults: (benchId: string) => TaskResult[];
  addRun: (payload: LaunchPayload) => string;
  cancelRun: (benchId: string) => void;
  datasetPatchRun: (
    benchRunId: string,
    patch: { row?: Partial<RunRow>; params?: Partial<RunParams>; tasks?: TaskResult[] }
  ) => void;
};

const RunsContext = createContext<Ctx | null>(null);

const COMPLETE_DELAY_MS = 4500;

function formToParams(benchId: string, form: RunLaunchForm): RunParams {
  return {
    benchId,
    startTime: null,
    finishTime: null,
    webBrowserPath: form.web_browser_path,
    webBrowserExtensionDir: form.web_browser_extension_dir,
    webBrowserUserDir: form.web_browser_user_dir,
    pipeline: form.pipeline,
    maxSteps: form.max_steps,
    maxConcurrent: form.max_concurrent,
    plannerModel: form.planner_model,
    plannerVersion: form.planner_version,
    navigatorModel: form.navigator_model,
    navigatorVersion: form.navigator_version,
    judgeName: form.judge_name,
    resultDir: `${form.result_dir.replace(/\/$/, "")}/${benchId}`,
    benchTestPath: form.bench_test_path,
    gigadoBackendUrl: form.gigado_backend_url,
    userId: form.user_id,
    runNumber: form.run_number,
    kubernetesPodId: form.kubernetes_pod_id || `pod-${benchId}`,
    createdAt: form.created_at,
    saveScreenshots: form.save_screenshots,
    screenshotsWithoutMarkup: form.screenshots_without_markup,
  };
}

export function RunsProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<RunRow[]>(() => [...seedRunRows]);
  const [paramsById, setParamsById] = useState<Record<string, RunParams>>(() => ({
    ...seedParamsByBenchId,
  }));
  const [tasksById, setTasksById] = useState<Record<string, TaskResult[]>>(() => ({
    ...seedTasksByBenchId,
  }));
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const clearTimer = useCallback((benchId: string) => {
    const t = timersRef.current[benchId];
    if (t) {
      clearTimeout(t);
      delete timersRef.current[benchId];
    }
  }, []);

  const getRunRow = useCallback((benchId: string) => rows.find((r) => r.benchId === benchId), [rows]);

  const getRunParams = useCallback(
    (benchId: string): RunParams =>
      paramsById[benchId] ?? {
        benchId,
        startTime: null,
        finishTime: null,
        webBrowserPath: "—",
        webBrowserExtensionDir: "—",
        webBrowserUserDir: "—",
        pipeline: "—",
        maxSteps: 0,
        maxConcurrent: 0,
        plannerModel: "—",
        plannerVersion: "—",
        navigatorModel: "—",
        navigatorVersion: "—",
        judgeName: "—",
        resultDir: "—",
        benchTestPath: "—",
        gigadoBackendUrl: "—",
        userId: "—",
        runNumber: 0,
        kubernetesPodId: "—",
        createdAt: new Date().toISOString(),
        saveScreenshots: false,
        screenshotsWithoutMarkup: false,
      },
    [paramsById]
  );

  const getTaskResults = useCallback(
    (benchId: string) => tasksById[benchId] ?? [],
    [tasksById]
  );

  const completeRun = useCallback((benchId: string, totalTasks: number) => {
    const startIso = new Date(Date.now() - COMPLETE_DELAY_MS).toISOString();
    const finishIso = new Date().toISOString();
    const ok = Math.max(0, Math.floor(totalTasks * 0.88));
    const fail = Math.max(0, totalTasks - ok);
    setRows((prev) =>
      prev.map((r) =>
        r.benchId !== benchId
          ? r
          : {
              ...r,
              status: "Завершен" as const,
              totalSuccess: ok,
              totalFailed: fail,
              startTime: startIso,
              finishTime: finishIso,
            }
      )
    );
    setParamsById((prev) => {
      const p = prev[benchId];
      if (!p) return prev;
      return {
        ...prev,
        [benchId]: { ...p, startTime: startIso, finishTime: finishIso },
      };
    });
    setTasksById((prev) => ({
      ...prev,
      [benchId]: buildDemoTasks(benchId, Math.min(12, totalTasks)),
    }));
  }, []);

  const addRun = useCallback(
    (payload: LaunchPayload) => {
      const benchId = `bench-${Date.now()}`;
      const params = formToParams(benchId, payload);
      const row: RunRow = {
        benchId,
        benchName: payload.benchmarkName,
        benchVersion: payload.benchmarkVersion,
        pipeline: payload.pipeline,
        totalTasks: payload.totalTasks,
        totalSuccess: null,
        totalFailed: null,
        startTime: null,
        finishTime: null,
        status: "В работе",
        maxConcurrent: payload.max_concurrent,
        plannerModel: payload.planner_model,
        plannerVersion: payload.planner_version,
        navigatorModel: payload.navigator_model,
        navigatorVersion: payload.navigator_version,
        judgeName: payload.judge_name,
        userId: payload.user_id,
        runNumber: payload.run_number,
        createdAt: payload.created_at,
      };

      setRows((prev) => [row, ...prev]);
      setParamsById((prev) => ({ ...prev, [benchId]: params }));
      setTasksById((prev) => ({ ...prev, [benchId]: [] }));

      clearTimer(benchId);
      timersRef.current[benchId] = setTimeout(() => {
        completeRun(benchId, payload.totalTasks);
        delete timersRef.current[benchId];
      }, COMPLETE_DELAY_MS);

      return benchId;
    },
    [clearTimer, completeRun]
  );

  const cancelRun = useCallback(
    (benchId: string) => {
      clearTimer(benchId);
      const row = rowsRef.current.find((r) => r.benchId === benchId);
      if (!row || row.status !== "В работе") return;

      const finishIso = new Date().toISOString();
      const startIso = row.startTime ?? row.createdAt;
      const partial = Math.max(1, Math.floor(row.totalTasks * 0.35));
      const ok = Math.floor(partial * 0.85);
      const fail = partial - ok;

      setRows((prev) =>
        prev.map((r) =>
          r.benchId !== benchId
            ? r
            : {
                ...r,
                status: "Прерван",
                totalSuccess: ok,
                totalFailed: fail,
                startTime: startIso,
                finishTime: finishIso,
              }
        )
      );
      setParamsById((prev) => {
        const p = prev[benchId];
        if (!p) return prev;
        return {
          ...prev,
          [benchId]: {
            ...p,
            startTime: startIso,
            finishTime: finishIso,
          },
        };
      });
      setTasksById((prev) => ({
        ...prev,
        [benchId]: buildDemoTasks(benchId, Math.min(5, partial)),
      }));
    },
    [clearTimer]
  );

  const datasetPatchRun = useCallback(
    (
      benchRunId: string,
      patch: { row?: Partial<RunRow>; params?: Partial<RunParams>; tasks?: TaskResult[] }
    ) => {
      if (patch.row) {
        setRows((prev) =>
          prev.map((r) => (r.benchId === benchRunId ? { ...r, ...patch.row } : r))
        );
      }
      if (patch.params) {
        setParamsById((prev) => {
          const cur = prev[benchRunId];
          if (!cur) return prev;
          return { ...prev, [benchRunId]: { ...cur, ...patch.params } };
        });
      }
      if (patch.tasks) {
        setTasksById((prev) => ({ ...prev, [benchRunId]: patch.tasks! }));
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      runs: rows,
      getRunRow,
      getRunParams,
      getTaskResults,
      addRun,
      cancelRun,
      datasetPatchRun,
    }),
    [rows, getRunRow, getRunParams, getTaskResults, addRun, cancelRun, datasetPatchRun]
  );

  return <RunsContext.Provider value={value}>{children}</RunsContext.Provider>;
}

export function useRuns() {
  const v = useContext(RunsContext);
  if (!v) throw new Error("useRuns outside RunsProvider");
  return v;
}
