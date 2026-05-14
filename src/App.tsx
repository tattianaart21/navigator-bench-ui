import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { BenchmarkProvider } from "./context/BenchmarkContext";
import { RunsProvider } from "./context/RunsContext";
import AdminShell from "./components/AdminShell";
import BenchmarksPage from "./pages/BenchmarksPage";
import BenchmarkDetailPage from "./pages/BenchmarkDetailPage";
import RunsPage from "./pages/RunsPage";
import RunDetailPage from "./pages/RunDetailPage";
import TaskDetailPage from "./pages/TaskDetailPage";

const ComparePage = lazy(() => import("./pages/ComparePage"));

export default function App() {
  return (
    <BenchmarkProvider>
      <RunsProvider>
        <Routes>
          <Route path="/" element={<AdminShell />}>
            <Route index element={<BenchmarksPage />} />
            <Route path="bench/:id" element={<BenchmarkDetailPage />} />
            <Route path="runs" element={<RunsPage />} />
            <Route path="runs/:runId/task/:taskId" element={<TaskDetailPage />} />
            <Route path="runs/:runId" element={<RunDetailPage />} />
            <Route
              path="compare"
              element={
                <Suspense
                  fallback={
                    <p className="admin-hint" style={{ padding: "2rem", margin: 0 }}>
                      Загрузка сравнения…
                    </p>
                  }
                >
                  <ComparePage />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </RunsProvider>
    </BenchmarkProvider>
  );
}
