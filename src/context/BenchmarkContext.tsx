import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildInitialBenchmarks, nextTaskIdForWeb } from "../data/initialBenchmarks";
import type { BenchTask, BenchmarkData, BenchmarkRunLaunchDefaults } from "../types/benchmark";
import { tasksEqual } from "../lib/tasksEqual";

function cloneTask(t: BenchTask): BenchTask {
  return { ...t };
}

function cloneVersionTasks(tasks: BenchTask[]): BenchTask[] {
  return tasks.map(cloneTask);
}

function latestVersion(b: BenchmarkData) {
  return b.versions[b.versions.length - 1];
}

export function needsVersionBumpForAdd(b: BenchmarkData): boolean {
  return b.versions.length > 1;
}

type Ctx = {
  benchmarks: BenchmarkData[];
  getBenchmark: (id: string) => BenchmarkData | undefined;
  createBenchmark: (name: string) => string;
  addTask: (
    benchId: string,
    fields: { web_name: string; task_ques: string; task_web: string },
    mode: "inPlace" | "newVersion"
  ) => void;
  updateTask: (
    benchId: string,
    internalId: string,
    fields: { web_name: string; task_ques: string; task_web: string },
    mode: "inPlace" | "newVersion"
  ) => void;
  setTaskArchived: (
    benchId: string,
    internalId: string,
    archived: boolean,
    mode: "newVersion"
  ) => void;
  /** Атомарно записать список тасок в последнюю версию или создать новую. */
  commitBenchTasks: (
    benchId: string,
    tasks: BenchTask[],
    mode: "inPlace" | "newVersion"
  ) => void;
  /** Скрытая правка демо-данных бенчмарка (без новой версии). */
  datasetPatchBenchmark: (
    benchId: string,
    patch: {
      name?: string;
      latestVersion?: Partial<{ label: string; createdAt: string; tasks: BenchTask[] }>;
      runLaunchDefaults?: BenchmarkRunLaunchDefaults | null;
    }
  ) => void;
};

const BenchmarkContext = createContext<Ctx | null>(null);

export function BenchmarkProvider({ children }: { children: ReactNode }) {
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>(buildInitialBenchmarks);

  const getBenchmark = useCallback(
    (id: string) => benchmarks.find((b) => b.id === id),
    [benchmarks]
  );

  const createBenchmark = useCallback((name: string) => {
    const id = `b${Date.now()}`;
    const v1: BenchmarkData["versions"][0] = {
      id: `${id}v1`,
      label: "v1",
      createdAt: new Date().toISOString(),
      tasks: [],
      parentVersionId: null,
    };
    setBenchmarks((prev) => [...prev, { id, name, versions: [v1], runLaunchDefaults: {} }]);
    return id;
  }, []);

  const addTask = useCallback(
    (
      benchId: string,
      fields: { web_name: string; task_ques: string; task_web: string },
      mode: "inPlace" | "newVersion"
    ) => {
      setBenchmarks((prev) =>
        prev.map((b) => {
          if (b.id !== benchId) return b;
          const last = latestVersion(b);
          const task_id = nextTaskIdForWeb(last.tasks, fields.web_name);
          const newTask: BenchTask = {
            internalId: `t-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            web_name: fields.web_name,
            task_id,
            task_ques: fields.task_ques,
            task_web: fields.task_web,
            archived: false,
          };

          if (mode === "inPlace") {
            const versions = b.versions.slice(0, -1);
            const updatedLast = {
              ...last,
              tasks: [...last.tasks, newTask],
            };
            return { ...b, versions: [...versions, updatedLast] };
          }

          const nextLabel = `v${b.versions.length + 1}`;
          const newVer: BenchmarkData["versions"][0] = {
            id: `${benchId}v${b.versions.length + 1}-${Date.now()}`,
            label: nextLabel,
            createdAt: new Date().toISOString(),
            tasks: cloneVersionTasks([...last.tasks, newTask]),
            parentVersionId: last.id,
          };
          return { ...b, versions: [...b.versions, newVer] };
        })
      );
    },
    []
  );

  const updateTask = useCallback(
    (
      benchId: string,
      internalId: string,
      fields: { web_name: string; task_ques: string; task_web: string },
      mode: "inPlace" | "newVersion"
    ) => {
      setBenchmarks((prev) =>
        prev.map((b) => {
          if (b.id !== benchId) return b;
          const last = latestVersion(b);
          const mapTask = (t: BenchTask) =>
            t.internalId === internalId ? { ...t, ...fields } : t;

          if (mode === "inPlace") {
            const versions = b.versions.slice(0, -1);
            const updatedLast = {
              ...last,
              tasks: last.tasks.map(mapTask),
            };
            return { ...b, versions: [...versions, updatedLast] };
          }

          const nextTasks = last.tasks.map(mapTask);
          const nextLabel = `v${b.versions.length + 1}`;
          const newVer: BenchmarkData["versions"][0] = {
            id: `${benchId}v${b.versions.length + 1}-${Date.now()}`,
            label: nextLabel,
            createdAt: new Date().toISOString(),
            tasks: cloneVersionTasks(nextTasks),
            parentVersionId: last.id,
          };
          return { ...b, versions: [...b.versions, newVer] };
        })
      );
    },
    []
  );

  const setTaskArchived = useCallback(
    (benchId: string, internalId: string, archived: boolean, mode: "newVersion") => {
      if (mode !== "newVersion") return;
      setBenchmarks((prev) =>
        prev.map((b) => {
          if (b.id !== benchId) return b;
          const last = latestVersion(b);
          const nextTasks = last.tasks.map((t) =>
            t.internalId === internalId ? { ...t, archived } : t
          );
          const nextLabel = `v${b.versions.length + 1}`;
          const newVer: BenchmarkData["versions"][0] = {
            id: `${benchId}v${b.versions.length + 1}-${Date.now()}`,
            label: nextLabel,
            createdAt: new Date().toISOString(),
            tasks: cloneVersionTasks(nextTasks),
            parentVersionId: last.id,
          };
          return { ...b, versions: [...b.versions, newVer] };
        })
      );
    },
    []
  );

  const commitBenchTasks = useCallback(
    (benchId: string, tasks: BenchTask[], mode: "inPlace" | "newVersion") => {
      setBenchmarks((prev) =>
        prev.map((b) => {
          if (b.id !== benchId) return b;
          const last = latestVersion(b);
          if (tasksEqual(tasks, last.tasks)) return b;

          if (mode === "inPlace") {
            const versions = b.versions.slice(0, -1);
            const updatedLast = {
              ...last,
              tasks: cloneVersionTasks(tasks),
            };
            return { ...b, versions: [...versions, updatedLast] };
          }

          const nextLabel = `v${b.versions.length + 1}`;
          const newVer: BenchmarkData["versions"][0] = {
            id: `${benchId}v${b.versions.length + 1}-${Date.now()}`,
            label: nextLabel,
            createdAt: new Date().toISOString(),
            tasks: cloneVersionTasks(tasks),
            parentVersionId: last.id,
          };
          return { ...b, versions: [...b.versions, newVer] };
        })
      );
    },
    []
  );

  const datasetPatchBenchmark = useCallback(
    (
      benchId: string,
      patch: {
        name?: string;
        latestVersion?: Partial<{ label: string; createdAt: string; tasks: BenchTask[] }>;
        runLaunchDefaults?: BenchmarkRunLaunchDefaults | null;
      }
    ) => {
      setBenchmarks((prev) =>
        prev.map((b) => {
          if (b.id !== benchId) return b;
          const last = latestVersion(b);
          const nextLast = {
            ...last,
            ...(patch.latestVersion?.label !== undefined ? { label: patch.latestVersion.label } : {}),
            ...(patch.latestVersion?.createdAt !== undefined
              ? { createdAt: patch.latestVersion.createdAt }
              : {}),
            ...(patch.latestVersion?.tasks !== undefined
              ? { tasks: cloneVersionTasks(patch.latestVersion.tasks) }
              : {}),
          };
          const versions = [...b.versions.slice(0, -1), nextLast];
          let runLaunchDefaults = b.runLaunchDefaults;
          if (patch.runLaunchDefaults === null) runLaunchDefaults = undefined;
          else if (patch.runLaunchDefaults !== undefined) {
            runLaunchDefaults = { ...b.runLaunchDefaults, ...patch.runLaunchDefaults };
          }
          return {
            ...b,
            ...(patch.name !== undefined ? { name: patch.name } : {}),
            versions,
            runLaunchDefaults,
          };
        })
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      benchmarks,
      getBenchmark,
      createBenchmark,
      addTask,
      updateTask,
      setTaskArchived,
      commitBenchTasks,
      datasetPatchBenchmark,
    }),
    [
      benchmarks,
      getBenchmark,
      createBenchmark,
      addTask,
      updateTask,
      setTaskArchived,
      commitBenchTasks,
      datasetPatchBenchmark,
    ]
  );

  return (
    <BenchmarkContext.Provider value={value}>{children}</BenchmarkContext.Provider>
  );
}

export function useBenchmarks() {
  const v = useContext(BenchmarkContext);
  if (!v) throw new Error("useBenchmarks outside BenchmarkProvider");
  return v;
}
