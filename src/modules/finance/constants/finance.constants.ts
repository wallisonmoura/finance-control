// pageSize usado sempre que uma leitura de Finance precisa do período inteiro
// de uma vez, sem paginação real — por exemplo os data helpers de Server
// Component e o endpoint GET /api/finance/history/full. GetTransactionHistoryUseCase
// sempre pagina; este valor apenas define uma página única grande o bastante
// para cobrir o histórico completo de um usuário no MVP.
export const FULL_PERIOD_PAGE_SIZE = 10_000;
