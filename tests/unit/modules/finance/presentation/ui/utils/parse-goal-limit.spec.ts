import { validateGoalLimitInput } from '@/modules/finance/presentation/ui/utils/parse-goal-limit';

describe('validateGoalLimitInput', () => {
  it.each(['300', '1500,5', '1500,50', '999999999999,99'])(
    'should accept %s',
    (value) => {
      expect(validateGoalLimitInput(value)).toBeNull();
    },
  );

  it.each(['', '0', '0,00'])('should ask for a positive limit for %p', (value) => {
    expect(validateGoalLimitInput(value)).toBe('Informe um limite maior que zero.');
  });

  it.each(['1500,555', '15.00', 'abc', '-5'])(
    'should reject %p as an invalid money format',
    (value) => {
      expect(validateGoalLimitInput(value)).toBe(
        'Informe um valor com no máximo duas casas decimais.',
      );
    },
  );

  it('should reject a limit above the app ceiling', () => {
    expect(validateGoalLimitInput('1000000000000')).toBe(
      'Informe um valor de até R$ 999.999.999.999,99.',
    );
  });

  it('should accept a custom message for a non-positive value', () => {
    expect(validateGoalLimitInput('0', 'Informe um valor maior que zero.')).toBe(
      'Informe um valor maior que zero.',
    );
  });
});
