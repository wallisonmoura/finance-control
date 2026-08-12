type ApiErrorResponse = {
  message?: string;
  error?: string;
};

/**
 * Extrai a mensagem de erro de uma resposta HTTP não-ok, lendo `message`
 * primeiro e caindo para `error`. Se o corpo não puder ser parseado como
 * JSON, retorna `fallbackMessage`.
 */
export async function parseApiError(
  response: Response,
  fallbackMessage: string = 'Não foi possível concluir a operação.',
): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorResponse;

    return body.message || body.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
