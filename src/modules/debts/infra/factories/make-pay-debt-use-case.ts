import { prisma } from '@/shared/infra/database/prisma/client';
import { PayDebtInput } from '../../application/dto/pay-debt.input';
import { PrismaDebtRepository } from '../repositories/prisma-debt.repository';
import { PrismaDebtPaymentFinancialEffectAdapter } from '../services/prisma-debt-payment-financial-effect.adapter';
import { PrismaDebtPaymentWalletEffectAdapter } from '../services/prisma-debt-payment-wallet-effect.adapter';
import { PayDebtUseCase } from '../../application/use-cases/pay-debt.use-case';

export function makePayDebtUseCase() {
  return {
    async execute(input: PayDebtInput) {
      return prisma.$transaction(async (tx) => {
        const debtRepository = new PrismaDebtRepository(tx);

        const debtPaymentFinancialEffectAdapter =
          new PrismaDebtPaymentFinancialEffectAdapter(tx);

        const debtPaymentWalletEffectAdapter =
          new PrismaDebtPaymentWalletEffectAdapter(tx);

        const payDebtUseCase = new PayDebtUseCase(
          debtRepository,
          debtPaymentFinancialEffectAdapter,
          debtPaymentWalletEffectAdapter,
        );

        return payDebtUseCase.execute(input);
      });
    },
  };
}
