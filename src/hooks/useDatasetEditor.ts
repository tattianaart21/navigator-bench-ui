import { useCallback, useEffect, useState } from "react";
import { isDatasetEditorEnabled, writeDatasetEditorToStorage } from "../lib/datasetEditor";

/** Скрытый режим редактирования демо-данных (без элементов в основном UI). Вкл/выкл: Ctrl+Shift+Alt+D или ?__navdata=1 */
export function useDatasetEditor() {
  const [enabled, setEnabled] = useState(() => isDatasetEditorEnabled());
  const [panelOpen, setPanelOpen] = useState(() => isDatasetEditorEnabled());

  const applyUrlFlag = useCallback((on: boolean) => {
    const u = new URL(window.location.href);
    if (on) u.searchParams.set("__navdata", "1");
    else u.searchParams.delete("__navdata");
    window.history.replaceState({}, "", u.toString());
  }, []);

  const sync = useCallback(() => {
    const on = isDatasetEditorEnabled();
    setEnabled(on);
    setPanelOpen(on);
  }, []);

  useEffect(() => {
    sync();
    const onPop = () => sync();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [sync]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.shiftKey || !e.altKey || e.code !== "KeyD") return;
      e.preventDefault();
      const next = !isDatasetEditorEnabled();
      writeDatasetEditorToStorage(next);
      applyUrlFlag(next);
      setEnabled(next);
      setPanelOpen(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyUrlFlag]);

  const disableCompletely = useCallback(() => {
    writeDatasetEditorToStorage(false);
    applyUrlFlag(false);
    setEnabled(false);
    setPanelOpen(false);
  }, [applyUrlFlag]);

  return { enabled, panelOpen, setPanelOpen, disableCompletely, sync };
}
