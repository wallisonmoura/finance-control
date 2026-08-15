const SECONDS_PER_UNIT: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

const DURATION_PATTERN = /^(\d+)([smhd])$/;

export function parseDurationToSeconds(duration: string): number {
  const match = DURATION_PATTERN.exec(duration);

  if (!match) {
    throw new Error(`Formato de duração inválido: "${duration}".`);
  }

  const [, amount, unit] = match;

  return Number(amount) * SECONDS_PER_UNIT[unit];
}
