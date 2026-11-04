import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobileMenu } from '@/shared/presentation/ui/layout/mobile-menu';

// The user menu, sign out and the debts bell come from other modules; the
// layout passes them in, so here they are plain placeholders.
const slots = {
  barSlot: <button type='button'>Sino</button>,
  userSlot: <p>Usuário logado</p>,
  footerSlot: <button type='button'>Sair</button>,
};

function renderMobileMenu(pathname = '/') {
  return render(<MobileMenu pathname={pathname} {...slots} />);
}

describe('MobileMenu', () => {
  it('should render the application logo for both light and dark theme', () => {
    renderMobileMenu();

    expect(screen.getAllByRole('img', { name: 'Finance Control' })).toHaveLength(2);
  });

  it('should start with the navigation menu closed', () => {
    renderMobileMenu();

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('should open the navigation menu when clicking the menu button', async () => {
    const user = userEvent.setup();

    renderMobileMenu();

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('should close the navigation menu when clicking the menu button twice', async () => {
    const user = userEvent.setup();

    renderMobileMenu();

    const menuButton = screen.getByRole('button', { name: 'Abrir menu' });

    await user.click(menuButton);
    await user.click(screen.getByRole('button', { name: 'Fechar menu' }));

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).not.toBeInTheDocument();

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should render the main navigation links when open', async () => {
    const user = userEvent.setup();

    renderMobileMenu();

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getByRole('link', { name: 'Painel' })).toHaveAttribute(
      'href',
      '/',
    );

    expect(screen.getByRole('link', { name: 'Carteira' })).toHaveAttribute(
      'href',
      '/wallet',
    );

    expect(screen.getByRole('link', { name: 'Financeiro' })).toHaveAttribute(
      'href',
      '/finance',
    );

    expect(screen.getByRole('link', { name: 'Dívidas' })).toHaveAttribute(
      'href',
      '/debts',
    );
  });

  it('should render the user and sign out slots only inside the open menu', async () => {
    const user = userEvent.setup();

    renderMobileMenu();

    expect(screen.queryByText('Usuário logado')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    const navigation = screen.getByRole('navigation', { name: 'Navegação principal mobile' });
    const userInfo = screen.getByText('Usuário logado');
    const signOut = screen.getByRole('button', { name: 'Sair' });

    expect(userInfo.compareDocumentPosition(navigation) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(navigation.compareDocumentPosition(signOut) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('should mark the active mobile link', async () => {
    const user = userEvent.setup();

    renderMobileMenu('/debts');

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getByRole('link', { name: 'Dívidas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should close the menu when clicking a navigation link', () => {
    renderMobileMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Carteira' }));

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).not.toBeInTheDocument();
  });

  it('should mark parent mobile link as active for subroutes', () => {
    renderMobileMenu('/debts/pending');

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getByRole('link', { name: 'Dívidas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should close the menu when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <MobileMenu pathname='/' {...slots} />
        <button type='button'>outside area</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'outside area' }));

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).not.toBeInTheDocument();
  });

  it('should render the bar slot (the debts bell) while the menu is closed', () => {
    renderMobileMenu();

    expect(screen.getByRole('button', { name: 'Sino' })).toBeInTheDocument();
  });

  it('should close the menu when pressing Escape', async () => {
    const user = userEvent.setup();

    renderMobileMenu();

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).not.toBeInTheDocument();
  });
});
