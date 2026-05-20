export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className='min-h-screen bg-slate-950 px-4 text-white'>
      <div className='mx-auto flex min-h-screen w-full max-w-md items-center py-6'>
        {children}
      </div>
    </main>
  );
}
