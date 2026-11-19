// Saves that are waiting to be sent (member data is written to the database
// a moment after each change). Signing out flushes them first, so a bookmark
// or journal entry made just before "Sign Out" isn't lost.

type Flush = () => Promise<void>;

const flushers = new Set<Flush>();

/** Register a "send it now" function; returns the unregister function. */
export function registerPendingSave(flush: Flush): () => void {
  flushers.add(flush);
  return () => {
    flushers.delete(flush);
  };
}

/** Send every waiting save now (gives up after `timeoutMs` so sign-out never hangs). */
export async function flushPendingSaves(timeoutMs = 3000): Promise<void> {
  if (flushers.size === 0) return;
  await Promise.race([
    Promise.allSettled([...flushers].map((flush) => flush())),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
