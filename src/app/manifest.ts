import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Finance Control',
    short_name: 'Finance',
    description:
      'Seu dinheiro, seu controle, seu futuro. Organize receitas, despesas, carteira e dívidas em uma plataforma simples e objetiva.',
    start_url: '/',
    scope: '/',
    lang: 'pt-BR',
    dir: 'ltr',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8FAFC',
    theme_color: '#020617',
    categories: ['finance', 'productivity'],
    prefer_related_applications: false,
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/maskable-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
