const MAX_MONEY_AMOUNT = 999999999999.99;

// The limit is typed with a decimal comma ("1500,50"), like other money
// inputs of the app. Returns NaN for empty or invalid text.
export function parseGoalLimitInput(value: string): number {
  if (!value.trim()) {
    return Number.NaN;
  }

  return Number(value.replace(',', '.'));
}

// Same client rules as the other money forms (expense, income, debt), kept
// in sync with the backend schema, so the user gets a precise message
// instead of the API's generic "Erro de validação.". Returns null when valid.
export function validateGoalLimitInput(
  value: string,
  // Spending goals speak of a "limite"; income goals pass their own wording.
  nonPositiveMessage = 'Informe um limite maior que zero.',
): string | null {
  const trimmed = value.trim();

  if (!trimmed || /^0+(,0{1,2})?$/.test(trimmed)) {
    return nonPositiveMessage;
  }

  if (!/^\d+(,\d{1,2})?$/.test(trimmed)) {
    return 'Informe um valor com no máximo duas casas decimais.';
  }

  if (parseGoalLimitInput(trimmed) > MAX_MONEY_AMOUNT) {
    return 'Informe um valor de até R$ 999.999.999.999,99.';
  }

  return null;
}

export function formatGoalLimitInput(value: number): string {
  return String(value).replace('.', ',');
}
