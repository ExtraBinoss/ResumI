import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { projects, storageMessage, type Project } from "../../../lib/projects";

type DashboardProjects = {
  records: Project[] | null;
  error: string;
  setError: (message: string) => void;
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
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const load = () => {
      void projects
        .list()
        .then((data) => {
          if (active) setRecords(data);
        })
        .catch((reason) => {
          if (active) setError(storageMessage(reason));
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
    <ProjectsContext value={{ records, error, setError, refresh }}>
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
