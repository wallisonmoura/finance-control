export function getSetCookieHeader(response: Response): string | null {
  return response.headers.get('set-cookie');
}
