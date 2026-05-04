export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className='min-h-screen bg-slate-100 text-slate-950'>
      <div className='mx-auto min-h-screen w-full max-w-md bg-white'>
        <header className='sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4'>
          <div>
            <strong className='block text-sm'>Finance Control</strong>
            <span className='text-xs text-slate-500'>Área privada</span>
          </div>
        </header>

        <div className='px-4 py-6'>{children}</div>
      </div>
    </main>
  );
}
