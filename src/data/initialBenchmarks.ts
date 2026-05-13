import type { BenchTask, BenchVersionData, BenchmarkData } from "../types/benchmark";

function makeTasksForBench(prefix: string, count: number): BenchTask[] {
  const groups = ["Amazon", "Amazon", "Ebay", "Ozon", "Shop", "Amazon"];
  const tasks: BenchTask[] = [];
  const perGroup = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    const web = groups[i % groups.length];
    const n = perGroup.get(web) ?? 0;
    perGroup.set(web, n + 1);
    const task_id = `${web}--${n}`;
    tasks.push({
      internalId: `${prefix}-t-${i}`,
      web_name: web,
      task_id,
      task_ques: `Сценарий ${i + 1}: найти товар в категории и перейти к карточке (${web}).`,
      task_web: i % 4 === 0 ? "" : `https://example.com/${web.toLowerCase()}/item/${i}`,
      archived: i % 17 === 0 && i > 0,
    });
  }
  return tasks;
}

function version(
  id: string,
  label: string,
  createdAt: string,
  tasks: BenchTask[],
  parent: string | null
): BenchVersionData {
  return { id, label, createdAt, tasks: tasks.map((t) => ({ ...t })), parentVersionId: parent };
}

export function buildInitialBenchmarks(): BenchmarkData[] {
  const b1tasks = makeTasksForBench("b1", 47);
  const b2tasks = makeTasksForBench("b2", 25).slice(0, 22);

  return [
    {
      id: "b1",
      name: "E-commerce навигация",
      versions: [
        version("b1v1", "v1", "2026-03-01T12:00:00Z", b1tasks.slice(0, 28), null),
        version("b1v2", "v2", "2026-04-22T08:00:00Z", b1tasks.slice(0, 40), "b1v1"),
        version("b1v3", "v3", "2026-05-10T11:00:00Z", b1tasks, "b1v2"),
      ],
    },
    {
      id: "b2",
      name: "Саппорт и тикеты",
      versions: [
        version("b2v1", "v1", "2026-05-01T14:00:00Z", b2tasks, null),
      ],
    },
  ];
}

export function nextTaskIdForWeb(tasks: BenchTask[], web_name: string): string {
  let max = -1;
  for (const t of tasks) {
    if (t.web_name !== web_name) continue;
    const m = /^.+--(\d+)$/.exec(t.task_id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  const next = max + 1;
  return `${web_name}--${next}`;
}

export function sortTasksForDisplay(tasks: BenchTask[]): BenchTask[] {
  return [...tasks].sort((a, b) => {
    const w = a.web_name.localeCompare(b.web_name, "ru");
    if (w !== 0) return w;
    return a.task_id.localeCompare(b.task_id, "ru", { numeric: true });
  });
}
