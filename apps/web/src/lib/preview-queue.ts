/** Cancellable visibility subscriptions. Running shared downloads may finish,
 * but stale queued work is removed before it can consume a connection. */
export function createPreviewQueue<T>(
  load: (key: string) => Promise<T>,
  concurrency = 3,
) {
  type Callback = (value: T | undefined) => void;
  type Job = { key: string; subscribers: Set<Callback> };
  const pending = new Map<string, Job>(),
    running = new Map<string, Job>();
  let active = 0;
  function pump() {
    while (active < concurrency && pending.size) {
      // Newly visible rows take precedence over older overscan positions.
      const job = [...pending.values()].at(-1)!;
      pending.delete(job.key);
      if (!job.subscribers.size) continue;
      active++;
      running.set(job.key, job);
      void load(job.key)
        .then(
          (value) => {
            for (const callback of job.subscribers) callback(value);
          },
          () => {
            for (const callback of job.subscribers) callback(undefined);
          },
        )
        .finally(() => {
          active--;
          running.delete(job.key);
          pump();
        });
    }
  }
  return {
    subscribe(key: string, callback: Callback) {
      let job = pending.get(key) ?? running.get(key);
      if (!job) {
        job = { key, subscribers: new Set() };
        pending.set(key, job);
      } else if (pending.has(key)) {
        pending.delete(key);
        pending.set(key, job);
      }
      job.subscribers.add(callback);
      pump();
      return () => {
        job.subscribers.delete(callback);
        if (!job.subscribers.size) pending.delete(key);
      };
    },
  };
}
