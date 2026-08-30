import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTheme } from 'next-themes';

import { ThemeToggle } from '@/shared/presentation/ui/components/theme-toggle';

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

const useThemeMock = jest.mocked(useTheme);

describe('ThemeToggle', () => {
  const setTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should always render the button, defaulting to dark-mode-switch before the theme resolves', () => {
    // The button must never be conditionally absent: it sits between sibling
    // elements (Button, ThemeToggle, DebtsDueSoonBell) in the header, and
    // toggling between "no element" and "an element" there causes a real
    // hydration mismatch in dev (confirmed via a browser error report) —
    // React loses sibling alignment when a component swaps between
    // rendering null and rendering content instead of just updating one.
    useThemeMock.mockReturnValue({
      resolvedTheme: undefined,
      setTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Ativar tema escuro' }),
    ).toBeInTheDocument();
  });

  it('should show a button to switch to dark mode when resolved theme is light', () => {
    useThemeMock.mockReturnValue({
      resolvedTheme: 'light',
      setTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Ativar tema escuro' }),
    ).toBeInTheDocument();
  });

  it('should switch to dark mode when clicked while resolved theme is light', async () => {
    const user = userEvent.setup();
    useThemeMock.mockReturnValue({
      resolvedTheme: 'light',
      setTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    await user.click(screen.getByRole('button', { name: 'Ativar tema escuro' }));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('should show a button to switch to light mode when resolved theme is dark', () => {
    useThemeMock.mockReturnValue({
      resolvedTheme: 'dark',
      setTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Ativar tema claro' }),
    ).toBeInTheDocument();
  });

  it('should switch to light mode when clicked while resolved theme is dark', async () => {
    const user = userEvent.setup();
    useThemeMock.mockReturnValue({
      resolvedTheme: 'dark',
      setTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    await user.click(screen.getByRole('button', { name: 'Ativar tema claro' }));

    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
