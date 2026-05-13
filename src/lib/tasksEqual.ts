import type { BenchTask } from "../types/benchmark";

function normalize(arr: BenchTask[]) {
  return [...arr]
    .sort((x, y) => x.internalId.localeCompare(y.internalId))
    .map((t) => ({
      internalId: t.internalId,
      web_name: t.web_name,
      task_id: t.task_id,
      task_ques: t.task_ques,
      task_web: t.task_web,
      archived: t.archived,
    }));
}

export function tasksEqual(a: BenchTask[], b: BenchTask[]): boolean {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}
