import { withTransaction } from '@/shared/infra/database/prisma/with-transaction';
import { PrismaDebtRepository } from '../repositories/prisma-debt.repository';
import { PrismaDebtPaymentFinancialEffectAdapter } from '../services/prisma-debt-payment-financial-effect.adapter';
import { PrismaDebtPaymentWalletEffectAdapter } from '../services/prisma-debt-payment-wallet-effect.adapter';
import { PayDebtUseCase } from '../../application/use-cases/pay-debt.use-case';

export function makePayDebtUseCase(): Pick<PayDebtUseCase, 'execute'> {
  return {
    execute: (input) =>
      withTransaction((tx) => {
        const payDebtUseCase = new PayDebtUseCase(
          new PrismaDebtRepository(tx),
          new PrismaDebtPaymentFinancialEffectAdapter(tx),
          new PrismaDebtPaymentWalletEffectAdapter(tx),
        );

        return payDebtUseCase.execute(input);
      }),
  };
}
