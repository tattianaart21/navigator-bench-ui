export interface BenchTask {
  internalId: string;
  web_name: string;
  task_id: string;
  task_ques: string;
  task_web: string;
  archived: boolean;
}

export interface BenchVersionData {
  id: string;
  label: string;
  createdAt: string;
  tasks: BenchTask[];
  parentVersionId: string | null;
}

export interface BenchmarkData {
  id: string;
  name: string;
  versions: BenchVersionData[];
}

export interface RunLaunchDraft {
  benchmarkId: string;
  selectedTaskInternalIds: string[] | null;
}
