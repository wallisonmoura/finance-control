// The limit is typed with a decimal comma ("1500,50"), like other money
// inputs of the app. Returns NaN for empty or invalid text.
export function parseGoalLimitInput(value: string): number {
  if (!value.trim()) {
    return Number.NaN;
  }

  return Number(value.replace(',', '.'));
}

export function formatGoalLimitInput(value: number): string {
  return String(value).replace('.', ',');
}
