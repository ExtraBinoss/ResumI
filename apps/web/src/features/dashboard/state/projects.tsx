import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  projects,
  storageErrorCode,
  type Project,
  type StorageErrorCode,
} from "../../../lib/projects";

type DashboardError =
  | { kind: "message"; value: string }
  | { kind: "storage"; code: StorageErrorCode }
  | { kind: "translation"; key: "site.errors.fileTooLarge" };
type DashboardProjects = {
  records: Project[] | null;
  error: DashboardError | null;
  setError: (message: string) => void;
  setStorageError: (code: StorageErrorCode) => void;
  setFileTooLargeError: () => void;
  refresh: () => Promise<void>;
};
const ProjectsContext = createContext<DashboardProjects | null>(null);

/** Read-only repository snapshots shared by dashboard routes, never an editor session. */
export function DashboardProjectsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [records, setRecords] = useState<Project[] | null>(null);
  const [error, setErrorState] = useState<DashboardProjects["error"]>(null);
  function setError(message: string) {
    setErrorState(message ? { kind: "message", value: message } : null);
  }
  function setStorageError(code: StorageErrorCode) {
    setErrorState({ kind: "storage", code });
  }
  function setFileTooLargeError() {
    setErrorState({ kind: "translation", key: "site.errors.fileTooLarge" });
  }
  useEffect(() => {
    let active = true;
    const load = () => {
      void projects
        .list()
        .then((data) => {
          if (active) setRecords(data);
        })
        .catch((reason) => {
          if (active)
            setErrorState({
              kind: "storage",
              code: storageErrorCode(reason),
            });
        });
    };
    load();
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
    };
  }, []);
  async function refresh() {
    setRecords(await projects.list());
  }
  return (
    <ProjectsContext
      value={{
        records,
        error,
        setError,
        setStorageError,
        setFileTooLargeError,
        refresh,
      }}
    >
      {children}
    </ProjectsContext>
  );
}
export function useDashboardProjects() {
  const context = useContext(ProjectsContext);
  if (!context)
    throw new Error("Dashboard routes require DashboardProjectsProvider.");
  return context;
}
