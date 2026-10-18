import { expect, test } from "bun:test";
import { createPreviewQueue } from "../../src/lib/preview-queue";

test("visible preview queue skips stale rows, prioritizes new rows and shares active loads", async () => {
  const started: string[] = [],
    completed: string[] = [];
  const deferred = new Map<string, (value: string) => void>();
  const queue = createPreviewQueue((key) => {
    started.push(key);
    return new Promise<string>((resolve) => {
      deferred.set(key, resolve);
    });
  }, 2);
  const watch = (key: string) =>
    queue.subscribe(key, () => completed.push(key));
  watch("active-a");
  watch("active-b");
  const cancelStale = watch("stale-c");
  watch("visible-d");
  cancelStale();
  watch("visible-e");
  const cancelShared = watch("active-a");
  cancelShared();
  expect(started).toEqual(["active-a", "active-b"]);
  deferred.get("active-a")!("a");
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  expect(started).toEqual(["active-a", "active-b", "visible-e"]);
  deferred.get("active-b")!("b");
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  expect(started).toEqual(["active-a", "active-b", "visible-e", "visible-d"]);
  deferred.get("visible-e")!("e");
  deferred.get("visible-d")!("d");
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  expect(completed).toEqual(["active-a", "active-b", "visible-e", "visible-d"]);
  expect(started).not.toContain("stale-c");
});

test("failed previews release a slot and canceled in-flight callbacks are never called", async () => {
  let fail: (() => void) | undefined;
  const completed: string[] = [];
  const queue = createPreviewQueue(
    (key) =>
      key === "failed"
        ? new Promise<string>((_, reject) => {
            fail = () => reject(new Error("Unavailable"));
          })
        : Promise.resolve(key),
    1,
  );
  const cancel = queue.subscribe("failed", () => completed.push("stale"));
  queue.subscribe("visible", (value) => completed.push(value!));
  cancel();
  fail!();
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  expect(completed).toEqual(["visible"]);
});
