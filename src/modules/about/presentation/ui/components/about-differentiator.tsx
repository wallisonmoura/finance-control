export function AboutDifferentiator() {
  return (
    <section className='bg-hero text-hero-foreground'>
      <div className='mx-auto max-w-3xl px-6 py-16 text-center lg:py-24'>
        <h2 className='text-3xl font-bold tracking-tight text-balance'>
          Seu saldo não é só o que entrou menos o que saiu.
        </h2>

        <p className='mx-auto mt-5 max-w-xl text-lg leading-relaxed text-hero-foreground/80'>
          A maioria dos apps financeiros mostra receita menos despesa e chama
          isso de saldo. Aqui não: seu saldo final é a soma real da sua
          carteira — banco, dinheiro e valores a receber — menos suas dívidas
          pendentes. É a diferença entre saber quanto você gastou e saber
          quanto você realmente tem.
        </p>
      </div>
    </section>
  );
}
