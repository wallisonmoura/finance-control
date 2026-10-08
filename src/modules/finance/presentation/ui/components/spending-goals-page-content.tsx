'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { ConfirmDialog } from '@/shared/presentation/ui/components/confirm-dialog';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { setCategoryMonthlyLimit } from '../services/finance-api.service';
import { SpendingGoalsOverviewUi, SpendingGoalUi } from '../types/finance-ui.types';
import { EditSpendingGoalForm } from './edit-spending-goal-form';
import { NewSpendingGoalForm } from './new-spending-goal-form';
import { SpendingGoalRow } from './spending-goal-row';

// The category history page lives in the reports module; finance only builds
// the path, so it does not depend on reports.
function getCategoryHistoryPath(categoryId: string): string {
  return `/relatorios/categorias/${categoryId}`;
}

type SpendingGoalsPageContentProps = {
  overview?: SpendingGoalsOverviewUi | null;
  error?: string | null;
};

const ACTION_BUTTON_CLASS_NAME = 'h-8 px-2 text-xs';

export function SpendingGoalsPageContent({ overview, error }: SpendingGoalsPageContentProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removingGoal, setRemovingGoal] = useState<SpendingGoalUi | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  function handleSaved() {
    setIsCreating(false);
    setEditingId(null);
    router.refresh();
  }

  async function confirmRemove() {
    if (!removingGoal) {
      return;
    }

    setIsRemoving(true);
    const response = await setCategoryMonthlyLimit(removingGoal.categoryId, null);
    setIsRemoving(false);
    setRemovingGoal(null);

    if (response.error) {
      setRemoveError(response.error);
      return;
    }

    setRemoveError(null);
    router.refresh();
  }

  const header = (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
      <PageTitle
        title='Metas de gasto'
        description='Defina um teto mensal para as categorias que você quer segurar.'
      />

      {overview && overview.availableCategories.length > 0 && !isCreating ? (
        <Button type='button' onClick={() => setIsCreating(true)}>
          <Plus aria-hidden='true' className='size-4' />
          Nova meta
        </Button>
      ) : null}
    </div>
  );

  if (error || !overview) {
    return (
      <div className='space-y-6'>
        {header}
        <LoadErrorState
          message={error ?? 'Não foi possível carregar as metas.'}
          onRetry={() => router.refresh()}
        />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {header}

      {isCreating ? (
        <NewSpendingGoalForm
          categories={overview.availableCategories}
          onSaved={handleSaved}
          onCancel={() => setIsCreating(false)}
        />
      ) : null}

      <FormErrorMessage message={removeError} />

      {overview.goals.length === 0 ? (
        <Card className='p-5'>
          <p className='text-sm text-muted-foreground'>
            Escolha as categorias que você quer segurar e defina um teto mensal pra
            cada uma. Durante o mês, cada meta mostra se você está no ritmo, acima
            dele ou se já passou do limite.
          </p>
        </Card>
      ) : (
        <Card className='p-5'>
          <ul className='space-y-5'>
            {overview.goals.map((goal) =>
              editingId === goal.categoryId ? (
                <li key={goal.categoryId} className='space-y-3'>
                  <p className='text-sm font-semibold text-foreground'>
                    {goal.categoryName}
                  </p>
                  <EditSpendingGoalForm
                    categoryId={goal.categoryId}
                    categoryName={goal.categoryName}
                    initialLimit={goal.limit}
                    average={overview.averageByCategoryId[goal.categoryId] ?? null}
                    onSaved={handleSaved}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <SpendingGoalRow
                  key={goal.categoryId}
                  goal={goal}
                  nameHref={getCategoryHistoryPath(goal.categoryId)}
                  actions={
                    <>
                      <Button
                        type='button'
                        variant='ghost'
                        className={ACTION_BUTTON_CLASS_NAME}
                        aria-label={`Editar meta de ${goal.categoryName}`}
                        onClick={() => setEditingId(goal.categoryId)}
                      >
                        Editar
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        className={ACTION_BUTTON_CLASS_NAME}
                        aria-label={`Remover meta de ${goal.categoryName}`}
                        onClick={() => setRemovingGoal(goal)}
                      >
                        Remover
                      </Button>
                    </>
                  }
                />
              ),
            )}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        open={removingGoal !== null}
        title='Remover meta'
        description={`A categoria ${removingGoal?.categoryName ?? ''} deixa de ser controlada. Os lançamentos dela não mudam.`}
        confirmLabel='Remover'
        confirmingLabel='Removendo...'
        isConfirming={isRemoving}
        onOpenChange={(open) => {
          if (!open) {
            setRemovingGoal(null);
          }
        }}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
