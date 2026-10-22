'use client';

import { Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/presentation/ui/components/button';
import { ConfirmDialog } from '@/shared/presentation/ui/components/confirm-dialog';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

import { undoDebtPayment } from '../services/debt-api.service';
import { DebtPaymentSourceUi, DebtUi } from '../types/debts-ui.types';

const SOURCE_LABEL: Record<DebtPaymentSourceUi, string> = {
  BANK: 'Banco',
  CASH: 'Dinheiro',
  RECEIVABLE: 'A receber',
};

type UndoDebtPaymentButtonProps = {
  debt: DebtUi;
  // For pages that keep the list in client state (router.refresh() alone does
  // not reload it), e.g. /debts.
  onUndone?: () => void | Promise<void>;
};

function getDescription(debt: DebtUi) {
  const source = debt.paymentSource ? SOURCE_LABEL[debt.paymentSource] : 'a Carteira';
  const base = `A dívida volta pra pendente, ${formatMoney(debt.amount)} volta para ${source} na Carteira e a despesa sai do Financeiro.`;

  if (debt.type !== 'RECURRING') {
    return base;
  }

  return `${base} A próxima ocorrência criada por este pagamento também será apagada, se ainda estiver pendente.`;
}

// The paid debt disappears from the list after the undo, so focus goes to the
// page title instead of being lost.
function focusPageTitle() {
  const heading = document.querySelector<HTMLElement>('main h1');

  if (heading) {
    heading.tabIndex = -1;
    heading.focus();
  }
}

export function UndoDebtPaymentButton({ debt, onUndone }: UndoDebtPaymentButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);

  async function handleConfirm() {
    setIsUndoing(true);
    const response = await undoDebtPayment(debt.id);
    setIsUndoing(false);

    if (response.error) {
      toast.error(response.error);
      return;
    }

    setOpen(false);
    toast.success('Pagamento desfeito.');
    await onUndone?.();
    router.refresh();
    focusPageTitle();
  }

  return (
    <>
      <Button
        type='button'
        variant='secondary'
        // Several paid debts can show this button at once: the name says which.
        aria-label={`Desfazer pagamento de ${debt.description}`}
        onClick={() => setOpen(true)}
        className='h-10 w-full rounded-lg px-4 text-sm shadow-none sm:w-auto'
      >
        <Undo2 aria-hidden='true' className='size-4' />
        Desfazer pagamento
      </Button>

      <ConfirmDialog
        open={open}
        title='Desfazer pagamento'
        description={getDescription(debt)}
        confirmLabel='Desfazer'
        confirmingLabel='Desfazendo...'
        isConfirming={isUndoing}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
      />
    </>
  );
}
