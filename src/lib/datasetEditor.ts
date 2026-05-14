const STORAGE_KEY = "navigator_bench_dataset_v1";
const URL_PARAM = "__navdata";

export function readDatasetEditorFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeDatasetEditorToStorage(on: boolean): void {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function readDatasetEditorFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get(URL_PARAM) === "1";
}

export function isDatasetEditorEnabled(): boolean {
  return readDatasetEditorFromUrl() || readDatasetEditorFromStorage();
}
