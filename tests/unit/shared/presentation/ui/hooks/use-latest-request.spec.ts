import { renderHook } from '@testing-library/react';

import { useLatestRequest } from '@/shared/presentation/ui/hooks/use-latest-request';

describe('useLatestRequest', () => {
  it('should treat only the newest request as current', () => {
    const { result } = renderHook(() => useLatestRequest());

    const isFirstLatest = result.current.start();
    const isSecondLatest = result.current.start();

    expect(isFirstLatest()).toBe(false);
    expect(isSecondLatest()).toBe(true);
  });

  it('should make a pending request stale when cancelled', () => {
    const { result } = renderHook(() => useLatestRequest());

    const isLatest = result.current.start();
    result.current.cancel();

    expect(isLatest()).toBe(false);
  });

  // Hooks put it in useCallback dependencies; a new object each render would
  // re-create their loaders and re-run their effects.
  it('should return the same functions across renders', () => {
    const { result, rerender } = renderHook(() => useLatestRequest());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
