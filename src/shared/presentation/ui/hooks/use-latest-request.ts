'use client';

import { useCallback, useMemo, useRef } from 'react';

type LatestRequest = {
  // Marks a new request as the latest; the returned function says whether it
  // still is when its response arrives.
  start: () => () => boolean;
  // Makes any pending request stale (e.g. on unmount).
  cancel: () => void;
};

// Discards responses that arrive after a newer request started, so a slow
// old response never overwrites a newer one.
export function useLatestRequest(): LatestRequest {
  const latestIdRef = useRef(0);

  const start = useCallback(() => {
    latestIdRef.current += 1;
    const requestId = latestIdRef.current;

    return () => requestId === latestIdRef.current;
  }, []);

  const cancel = useCallback(() => {
    latestIdRef.current += 1;
  }, []);

  return useMemo(() => ({ start, cancel }), [start, cancel]);
}
