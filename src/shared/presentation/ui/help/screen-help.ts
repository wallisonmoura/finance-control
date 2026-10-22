// In-app help: what each screen is for, written for someone who never used the
// app (first came from a new user who tried to register a future debt under
// Despesas). Kept in one file so the copy can be reviewed and tuned in one place.

export type HelpLink = {
  label: string;
  href: string;
};

export type ScreenHelpContent = {
  whatIs: string;
  actions: string[];
  // A short warning shown after the actions.
  note?: string;
  // Only where people realistically confuse this screen with another one.
  elsewhere?: {
    text: string;
    links: HelpLink[];
  };
};

export type ScreenHelpKey =
  | 'dashboard'
  | 'wallet'
  | 'incomes'
  | 'expenses'
  | 'history'
  | 'summary'
  | 'debts'
  | 'pendingDebts'
  | 'reports'
  | 'goals'
  | 'categoryHistory'
  | 'revenueHistory'
  | 'profitHistory';

// Registering income or expense never touches the wallet balances (only paying
// a debt does), and new users expect it to.
const CARTEIRA_NOTE = 'Isso não altera os saldos da Carteira.';

export const SCREEN_HELP: Record<ScreenHelpKey, ScreenHelpContent> = {
  dashboard: {
    whatIs: 'Um resumo de como está seu dinheiro hoje e de como vai o mês.',
    actions: [
      'Ver quanto você tem, quanto deve e quanto sobra',
      'Acompanhar suas metas de ganho do mês',
      'Ler os destaques do mês (onde gastou mais, onde economizou)',
      'Ver os últimos lançamentos',
    ],
  },
  wallet: {
    whatIs: 'O dinheiro que você tem hoje: no banco, em espécie e o que tem pra receber.',
    actions: [
      'Ver cada saldo e o total',
      'Corrigir os saldos quando mudarem (ex.: conferiu o extrato do banco)',
    ],
    elsewhere: {
      text: 'Ganhou ou gastou? Lance em Receitas ou Despesas, mas isso não muda os saldos daqui: atualize-os quando o saldo real mudar. E mudar um saldo aqui não conta como receita nem como despesa.',
      links: [
        { label: 'Ir para Receitas', href: '/finance/incomes' },
        { label: 'Ir para Despesas', href: '/finance/expenses' },
      ],
    },
  },
  incomes: {
    whatIs: 'O dinheiro que já entrou pra você (venda, corrida, salário, serviço).',
    actions: ['Lançar uma receita com valor e data', 'Editar ou excluir uma receita'],
    note: CARTEIRA_NOTE,
  },
  expenses: {
    whatIs: 'O dinheiro que já saiu, separado por categoria.',
    actions: [
      'Lançar uma despesa com valor, data e categoria',
      'Editar ou excluir uma despesa (exceto as que vieram do pagamento de uma dívida)',
      'Ver as despesas que vieram do pagamento de uma dívida',
    ],
    note: CARTEIRA_NOTE,
    elsewhere: {
      text: 'Vai pagar depois? Cadastre em Dívidas. Quando você pagar, a despesa aparece aqui sozinha.',
      links: [{ label: 'Ir para Dívidas', href: '/debts' }],
    },
  },
  history: {
    whatIs: 'Todas as suas receitas e despesas juntas, por período.',
    actions: [
      'Filtrar por datas, por tipo (receita ou despesa) e por categoria',
      'Ver os totais do período',
    ],
  },
  summary: {
    whatIs: 'O resultado do mês, dia a dia: quanto entrou, quanto saiu e o que sobrou.',
    actions: [
      'Escolher o mês',
      'Ver as receitas, as despesas e o resultado do mês',
      'Ver o resultado de cada dia',
    ],
    elsewhere: {
      text: 'Quer saber quanto dinheiro você tem hoje? Veja o Painel ou a Carteira.',
      links: [
        { label: 'Ir para o Painel', href: '/' },
        { label: 'Ir para Carteira', href: '/wallet' },
      ],
    },
  },
  debts: {
    whatIs: 'As contas que você ainda vai pagar e as que já pagou.',
    actions: [
      'Cadastrar uma conta, à vista ou parcelada (até 12x)',
      'Marcar como recorrente (aluguel, internet): quando você paga, a do mês seguinte é criada sozinha',
      'Ver as contas de cada mês e quanto falta pagar',
      'Abrir as pendentes pra pagar',
    ],
    elsewhere: {
      text: 'Já pagou na hora? Lance em Despesas.',
      links: [{ label: 'Ir para Despesas', href: '/finance/expenses' }],
    },
  },
  pendingDebts: {
    whatIs: 'As contas que ainda não foram pagas.',
    actions: [
      'Pagar uma conta escolhendo de onde saiu o dinheiro (banco, dinheiro ou a receber)',
      'Ao pagar, o valor sai desse saldo da Carteira e vira uma despesa, tudo de uma vez',
    ],
    note: 'Pagou a errada? Dá pra desfazer em até 24h, em Dívidas pagas.',
  },
  reports: {
    whatIs: 'Gráficos de como seu dinheiro andou nos últimos meses.',
    actions: [
      'Escolher 3, 6 ou 12 meses',
      'Comparar receitas e despesas mês a mês',
      'Ver em que categorias você mais gasta',
      'Clicar numa categoria pra ver o histórico dela',
    ],
  },
  goals: {
    whatIs: 'Quanto você quer ganhar no mês e quanto quer gastar, no máximo, em cada categoria.',
    actions: [
      'Definir uma meta de faturamento (tudo o que entrou) e uma de lucro (o que entrou menos o que saiu)',
      'Definir um limite de gasto por mês pra algumas categorias',
      'Ver se você está no ritmo ou atrasado',
    ],
  },
  categoryHistory: {
    whatIs: 'Quanto você gastou nesta categoria em cada mês.',
    actions: [
      'Comparar cada mês com o seu limite de gasto',
      'Ver a média e o mês em que mais gastou',
      'Definir ou mudar o limite de gasto',
      'Abrir os lançamentos desta categoria',
    ],
  },
  revenueHistory: {
    whatIs: 'Tudo o que entrou em cada mês, comparado com a sua meta.',
    actions: [
      'Ver em quantos meses você bateu a meta',
      'Ver a média e o seu melhor mês',
      'Mudar a meta de faturamento',
    ],
  },
  profitHistory: {
    whatIs: 'O que sobrou em cada mês (receitas menos despesas), comparado com a sua meta.',
    actions: [
      'Ver em quantos meses você bateu a meta e em quantos fechou no vermelho',
      'Ver a média e o seu melhor mês',
      'Mudar a meta de lucro',
    ],
  },
};

export type TermHelpKey = 'finalBalance' | 'walletTotal' | 'pendingDebts';

// The three figures on the Painel hero, one short explanation each.
export const TERM_HELP: Record<TermHelpKey, { term: string; text: string }> = {
  finalBalance: {
    term: 'Saldo Final',
    text: 'Quanto sobra de verdade se você pagar todas as contas pendentes. É o Valor Total da Carteira menos as Dívidas Pendentes.',
  },
  walletTotal: {
    term: 'Valor Total da Carteira',
    text: 'Todo o dinheiro que você tem hoje: banco + dinheiro em espécie + valores a receber. Esses valores vêm da tela Carteira.',
  },
  pendingDebts: {
    term: 'Dívidas Pendentes',
    text: 'A soma das contas cadastradas que você ainda não pagou. Quando você paga uma, ela sai daqui.',
  },
};
