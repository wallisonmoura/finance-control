export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The public flow (/about, /login, /register) is always dark —
    // a deliberate brand choice, independent of the app's own light/dark
    // toggle (which only exists once authenticated). Forcing the `dark`
    // class here, rather than changing next-themes' defaultTheme, keeps
    // this scoped to unauthenticated pages only and avoids a jarring
    // theme flip for a visitor whose system/stored preference is light.
    <main className='dark min-h-screen bg-background text-foreground'>
      {children}
    </main>
  );
}
