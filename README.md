# Finance Control

Sistema web de controle financeiro operacional, construído para substituir o uso de planilhas por uma aplicação web responsiva, com foco em uso mobile, registros rápidos do dia a dia e evolução segura ao longo do tempo. O projeto foi concebido como um **monólito modular** em **Next.js**, seguindo **Clean Architecture** e **Hexagonal Architecture**, para manter o domínio desacoplado da infraestrutura e evitar overengineering no MVP.

## Objetivo

O objetivo do **Finance Control** é centralizar a operação financeira diária em um único ambiente, reduzindo atrito no lançamento de informações e eliminando cálculos manuais hoje feitos em planilhas. O escopo inicial do MVP contempla:

- registro de ganhos diários
- registro de gastos operacionais
- categorização de gastos
- visualização de saldo disponível
- cálculo automático de lucro diário
- cálculo automático de resumo mensal
- controle de dívidas

Esses objetivos refletem diretamente a visão inicial do produto e o foco em simplicidade, praticidade e uso em dispositivos móveis.

## Problema que o projeto resolve

Atualmente, o controle financeiro é feito em planilhas, o que traz limitações relevantes no uso diário, especialmente no celular. Entre os principais problemas estão:

- baixa usabilidade em smartphones
- dependência de computador para atualizações
- cálculos manuais em algumas etapas
- risco de erro na consolidação de dados
- ausência de uma interface otimizada para registros rápidos

A proposta do sistema é substituir esse fluxo por uma aplicação web mais prática, organizada e adequada ao uso móvel.

## Escopo do MVP

A primeira versão do sistema foi definida para substituir a planilha atual cobrindo as funcionalidades essenciais:

- autenticação de usuário
- registro de ganhos
- registro de gastos
- categorização de gastos
- controle de dívidas
- visualização de saldo disponível
- cálculo automático de lucro diário
- cálculo automático de resumo mensal

O MVP prioriza clareza, confiabilidade e velocidade de uso.

## Arquitetura

O sistema segue uma abordagem de **monólito modular**, organizado por domínio e por camadas:

```txt
Presentation → Application → Domain ← Infrastructure
```

### Camadas

#### Domain

Camada central do sistema. Contém entidades, value objects, regras de negócio e contratos de repositório. Não depende de framework, ORM ou detalhes de infraestrutura.

#### Application

Responsável por orquestrar os casos de uso. Depende apenas do domínio e não conhece Next.js, Prisma ou React.

#### Infrastructure

Implementa adapters concretos, como repositórios com Prisma, serviços técnicos e integrações.

#### Presentation

Responsável por páginas, rotas, formulários, componentes e entrada/saída HTTP. Não deve concentrar regra de negócio.

## Organização por módulos

O projeto é organizado por domínio, e não por tipo de arquivo. Os módulos principais são:

- `auth`
- `finance`
- `debts`

Cada módulo segue a separação interna:

```txt
module/
  domain/
  application/
  infra/
  presentation/
```

Essa estrutura foi definida para facilitar manutenção, escalabilidade e isolamento de responsabilidades.

## Stack principal

A base tecnológica do projeto é composta por:

- **Next.js**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **Docker Compose**
- **React Hook Form**
- **Zod**
- **Jest**

Na fase inicial, o backend fica integrado ao próprio Next.js por meio de **Route Handlers** e proteção de rotas via `proxy.ts`, mantendo simplicidade para o MVP.

## Modelagem de dados

A modelagem inicial foi planejada para suportar o MVP sem persistir dados derivados como saldo, lucro diário ou resumo mensal. Esses valores devem ser calculados sob demanda a partir dos lançamentos e, quando aplicável, das dívidas pendentes.

Principais entidades persistidas:

- `users`
- `wallets`
- `expense_categories`
- `transactions`
- `debts`

### Regras importantes do modelo

- ganhos e gastos devem ter valor maior que zero
- gastos devem possuir categoria
- toda dívida nasce com status pendente
- pagar uma dívida deve alterar seu status e gerar um gasto correspondente
- consultas devem suportar filtros por dia, mês, ano e intervalo
- os dados devem ser isolados por usuário

## Regras de negócio essenciais

Alguns princípios do domínio são centrais no projeto:

- **fonte única da verdade**: saldo, lucro e resumos são derivados dos registros
- **consistência automática**: criar, editar ou excluir lançamentos deve refletir nos cálculos
- **validação no domínio**: regras críticas não devem existir apenas na UI
- **sem regra de negócio na interface**
- **sem regra de negócio na infraestrutura**

Esses princípios são a base do comportamento funcional do sistema.

## Estrutura sugerida do projeto

```txt
finance-control/
├── docker-compose.yml
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── src/
    ├── app/
    │   └── api/
    ├── modules/
    │   ├── auth/
    │   │   ├── domain/
    │   │   ├── application/
    │   │   ├── infra/
    │   │   └── presentation/
    │   ├── finance/
    │   │   ├── domain/
    │   │   ├── application/
    │   │   ├── infra/
    │   │   └── presentation/
    │   └── debts/
    │       ├── domain/
    │       ├── application/
    │       ├── infra/
    │       └── presentation/
    └── shared/
        └── infra/database/prisma/client.ts
```

## Estado atual do projeto

Baseado na documentação consolidada e no andamento recente do desenvolvimento, o projeto se encontra neste ponto:

### Base técnica concluída

- projeto Next.js criado
- Docker Compose configurado
- PostgreSQL rodando
- Prisma configurado
- `schema.prisma` criado
- migration inicial executada
- banco validado

### Módulo Auth

Backend do módulo **Auth** já estruturado e validado no projeto, com:

- camadas `domain`, `application`, `infra` e `presentation`
- autenticação real com banco
- geração de token
- cookie `httpOnly`
- rotas de autenticação
- endpoint de sessão atual
- proteção inicial de rotas com `proxy.ts`
- testes unitários e de integração

### Módulo Finance

O módulo **Finance** já avançou além da modelagem inicial e está em implementação incremental do backend:

- Fase 1 concluída: domínio, aplicação, contratos e testes unitários
- Fase 2 concluída: mappers Prisma e repositórios concretos
- Fase 3 em andamento/validação operacional: factories, controllers, rotas de comandos e integração com autenticação

### Próximos módulos

- `debts`: planejado após consolidação do backend principal de `finance`
- `UI`: ficará para etapa posterior
- `PWA`: previsto após a aplicação principal estar funcional

## Estratégia de implementação

A implementação do sistema segue esta ordem macro:

1. `auth`
2. `finance`
3. `debts`
4. `UI`
5. `PWA`

Cada módulo evolui em fases:

### Fase 1

- `domain`
- `application`
- contratos de repositório
- testes unitários

### Fase 2

- `infra` com Prisma
- rotas
- testes de integração
- testes com Rest Client

### Fase 3

- UI

Esse fluxo foi definido para consolidar primeiro o núcleo de regras e casos de uso, antes da interface.

## Casos de uso centrais

### Auth

- autenticar usuário
- encerrar sessão
- consultar sessão atual

### Finance

- registrar ganho diário
- registrar gasto operacional
- categorizar gasto
- editar e excluir lançamentos
- consultar lançamentos do dia
- consultar histórico
- calcular lucro diário
- calcular resumo mensal
- visualizar saldo disponível

### Debts

- registrar dívida
- editar dívida
- excluir dívida
- listar dívidas
- consultar dívidas pendentes
- marcar dívida como paga

## Como rodar o projeto localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Subir o banco com Docker

```bash
docker compose up -d
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` com:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_control?schema=public"
```

### 4. Executar migrations

```bash
npx prisma migrate dev
```

### 5. Gerar o client do Prisma

```bash
npx prisma generate
```

### 6. Rodar a aplicação

```bash
npm run dev
```

## Testes

A estratégia de testes do projeto está dividida em três frentes principais:

### Testes unitários

Cobrem domínio, value objects, regras de negócio e casos de uso.

### Testes de integração

Cobrem repositórios Prisma, integração com PostgreSQL e fluxos reais entre aplicação e persistência.

### Testes HTTP / Rest Client

Validam contratos de entrada e saída das rotas antes da camada de UI.

## Diretrizes arquiteturais obrigatórias

- o `domain` não depende de Prisma
- o `application` não depende de framework
- a `infra` implementa adapters concretos
- `app/api` apenas orquestra entrada e saída
- cálculos financeiros devem ficar em `domain` e `application`
- a UI não deve conter regra de negócio
- evitar overengineering

Essas regras são parte da base operacional do projeto e devem ser preservadas nas próximas features.

## Evolução futura

A arquitetura já foi pensada para suportar, sem refatorações profundas:

- dashboards com gráficos
- relatórios detalhados
- exportação de dados
- categorização avançada
- múltiplos usuários
- múltiplas carteiras
- experiência PWA
- eventual separação entre frontend e backend

## Observações finais

O **Finance Control** prioriza uma abordagem pragmática: simples no MVP, organizada desde o início e pronta para crescer com segurança.

O objetivo não é apenas criar uma aplicação funcional, mas manter uma base técnica limpa, previsível e consistente com os princípios arquiteturais definidos para o projeto.
