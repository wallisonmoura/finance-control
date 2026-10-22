import { withTransaction } from '@/shared/infra/database/prisma/with-transaction';
import { PrismaDebtRepository } from '../repositories/prisma-debt.repository';
import { PrismaDebtPaymentFinancialEffectAdapter } from '../services/prisma-debt-payment-financial-effect.adapter';
import { PrismaDebtPaymentWalletEffectAdapter } from '../services/prisma-debt-payment-wallet-effect.adapter';
import { UndoDebtPaymentUseCase } from '../../application/use-cases/undo-debt-payment.use-case';

export function makeUndoDebtPaymentUseCase(): Pick<UndoDebtPaymentUseCase, 'execute'> {
  return {
    execute: (input) =>
      withTransaction((tx) => {
        const undoDebtPaymentUseCase = new UndoDebtPaymentUseCase(
          new PrismaDebtRepository(tx),
          new PrismaDebtPaymentFinancialEffectAdapter(tx),
          new PrismaDebtPaymentWalletEffectAdapter(tx),
        );

        return undoDebtPaymentUseCase.execute(input);
      }),
  };
}
