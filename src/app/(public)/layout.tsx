export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className='min-h-screen bg-slate-950 px-4 py-8 text-white'>
      <div className='mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center'>
        {children}
      </div>
    </main>
  );
}
