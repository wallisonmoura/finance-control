export function parseDateFromQuery(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

export function parseExclusiveEndDateFromQuery(value: string): Date {
  const date = parseDateFromQuery(value);

  date.setUTCDate(date.getUTCDate() + 1);

  return date;
}
