import { ScreenshotCarousel } from './screenshot-carousel';
import type { CarouselSlide } from './screenshot-carousel';

const SLIDES: CarouselSlide[] = [
  {
    src: '/images/about/painel.png',
    alt: 'Painel com saldo final, carteira e transações recentes',
    caption: 'Sua posição financeira real assim que abre o app.',
  },
  {
    src: '/images/about/carteira.png',
    alt: 'Carteira com saldo em banco, dinheiro e valores a receber',
    caption:
      'Banco, dinheiro em espécie e valores a receber — separados, do jeito que é de verdade.',
  },
  {
    src: '/images/about/financeiro.png',
    alt: 'Histórico financeiro com total de receitas, despesas e movimentações',
    caption:
      'Receitas e despesas lado a lado, com total do período sempre à vista.',
  },
  {
    src: '/images/about/dividas.png',
    alt: 'Dívidas cadastradas, pendentes e pagas',
    caption:
      'Única, parcelada ou recorrente. Pague uma vez e o sistema atualiza sua carteira sozinho.',
  },
  {
    src: '/images/about/relatorios.png',
    alt: 'Relatórios com gráficos de receita, despesa e categorias',
    caption:
      'Gastos por categoria, receita e despesa por mês, dívidas pagas — tudo em gráfico.',
  },
];

export function AboutScreens() {
  return (
    <section className='bg-card'>
      <div className='mx-auto max-w-6xl px-6 py-16 lg:py-24'>
        <h2 className='text-center text-3xl font-bold tracking-tight text-foreground'>
          Veja o Finance Control por dentro
        </h2>

        <p className='mx-auto mt-3 max-w-xl text-center text-muted-foreground'>
          Sem mockup, sem imagem de banco de dados — as telas reais do
          sistema, com dados de exemplo.
        </p>

        <div className='mt-10'>
          <ScreenshotCarousel slides={SLIDES} />
        </div>
      </div>
    </section>
  );
}
