import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Alert, Button, Loader } from "@mantine/core";
import { projects, storageMessage } from "../../src/lib/projects";
export const meta = () => [
  { title: "Create a resume — ResumI" },
  { name: "robots", content: "noindex" },
];
export default function NewResume() {
  const navigate = useNavigate(),
    [params] = useSearchParams(),
    [error, setError] = useState("");
  const template = params.get("template") ?? "studio";
  useEffect(() => {
    let active = true;
    // Delay the external write one task so StrictMode's discarded mount cannot create an orphan.
    const timer = setTimeout(() => {
      void projects
        .create(template)
        .then((p) => {
          if (active) void navigate(`/editor/${p.id}`, { replace: true });
        })
        .catch((e) => {
          if (active) setError(storageMessage(e));
        });
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [navigate, template]);
  return (
    <main className="recovery">
      <h1>A fresh start.</h1>
      {error ? (
        <Alert color="red">{error}</Alert>
      ) : (
        <>
          <Loader size="sm" />
          <p>Creating your local resume…</p>
        </>
      )}
      <Button component={Link} to="/projects" mt="lg" variant="subtle">
        Back to projects
      </Button>
    </main>
  );
}
