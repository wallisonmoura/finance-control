// Full page navigation, kept apart so tests can replace it (jsdom does not
// navigate).
export function navigateTo(url: string): void {
  window.location.assign(url);
}
