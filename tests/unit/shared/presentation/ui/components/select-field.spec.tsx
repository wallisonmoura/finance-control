import { render, screen } from '@testing-library/react';

import { SelectField } from '@/shared/presentation/ui/components/select-field';

describe('SelectField', () => {
  it('deve renderizar select associado ao label', () => {
    render(
      <SelectField
        id='category'
        label='Categoria'
        options={[{ label: 'Mercado', value: 'market' }]}
      />,
    );

    expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
  });

  it('deve renderizar placeholder e opções', () => {
    render(
      <SelectField
        id='payment-source'
        label='Origem'
        placeholder='Selecione a origem'
        options={[
          { label: 'Banco', value: 'BANK' },
          { label: 'Dinheiro', value: 'CASH' },
        ]}
      />,
    );

    expect(screen.getByRole('option', { name: 'Selecione a origem' }))
      .toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banco' })).toHaveValue('BANK');
    expect(screen.getByRole('option', { name: 'Dinheiro' })).toHaveValue(
      'CASH',
    );
  });
});
