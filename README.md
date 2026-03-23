# Finance Control

Sistema web de controle financeiro operacional, pensado inicialmente para uso pessoal, com foco em registros rápidos no celular, organização financeira do dia a dia e evolução futura sem reestruturações profundas.

O projeto nasce para substituir o uso de planilhas por uma aplicação web responsiva, otimizada para uso mobile, capaz de registrar ganhos, gastos e dívidas, além de calcular saldo, lucro diário e resumo mensal automaticamente.

## Objetivo

O **Finance Control** tem como objetivo centralizar a operação financeira diária em um único ambiente, reduzindo atrito no lançamento de informações e eliminando cálculos manuais que hoje existem em planilhas. Entre os objetivos do sistema estão:

- registrar ganhos diários
- registrar gastos operacionais
- acompanhar saldo disponível
- controlar dívidas
- visualizar resultado diário e mensal
- automatizar cálculos financeiros recorrentes

Esse direcionamento faz parte do escopo inicial do MVP e foi definido para priorizar simplicidade, praticidade e uso em dispositivos móveis.

## Problema que o projeto resolve

Atualmente, o controle financeiro é feito em planilhas, o que gera limitações importantes no uso diário, especialmente em smartphones. Entre os principais problemas estão a baixa usabilidade em dispositivos móveis, a dependência de computador para atualizações e o risco de erros em consolidações e cálculos manuais.

## Escopo inicial do MVP

A primeira versão do sistema foi pensada para substituir completamente a planilha atual, cobrindo as funcionalidades essenciais:

- registro de ganhos diários
- registro de gastos
- categorização de gastos
- controle de dívidas
- visualização de saldo disponível
- cálculo automático de lucro diário
- cálculo automático de resumo mensal

O MVP prioriza clareza, confiabilidade e velocidade de uso.

## Arquitetura

O sistema segue uma abordagem de **monólito modular**, com base em:

- **Clean Architecture**
- **Hexagonal Architecture (Ports and Adapters)**

A separação principal do sistema é:

```txt
Presentation → Application → Domain ← Infrastructure
```

### Camadas

#### Domain

Camada central do sistema. Contém entidades, value objects, regras de negócio e contratos de repositório. Não depende de framework, ORM ou infraestrutura.

#### Application

Responsável por orquestrar os casos de uso do sistema. Depende apenas do domínio e não conhece detalhes técnicos de banco, Next.js ou Prisma.

#### Infrastructure

Implementa adapters concretos, como repositórios com Prisma, serviços técnicos e integrações externas.

#### Presentation

Responsável pela interface, rotas, formulários, páginas e interação com o usuário. Não deve concentrar regra de negócio.

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

A base tecnológica do projeto é:

- **Next.js**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **Docker Compose**
- **React Hook Form**
- **Zod**
- **Jest**

Na fase inicial, o backend fica integrado ao próprio Next.js por meio de **Route Handlers** e, quando necessário, **Server Actions**, evitando complexidade desnecessária para o MVP.

## Modelagem de dados

A modelagem inicial do banco foi planejada para suportar o MVP sem persistir dados derivados como saldo, lucro diário ou resumo mensal. Esses valores devem ser sempre calculados sob demanda a partir dos lançamentos e das dívidas pendentes.

As principais entidades persistidas são:

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

Algumas diretrizes do domínio são centrais no projeto:

- **fonte única da verdade**: saldo, lucro e resumos são derivados dos registros
- **consistência automática**: criar, editar ou excluir lançamentos deve refletir nos cálculos
- **validação no domínio**: regras críticas não devem existir apenas na UI
- **sem regra de negócio na interface**
- **sem regra de negócio na infraestrutura**

Esses princípios garantem previsibilidade e reduzem risco de inconsistência funcional.

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

Essa organização é a base recomendada para manter o projeto modular e evolutivo.

## Estado atual do projeto

Baseado na documentação consolidada do projeto, a base técnica inicial já contempla:

- projeto Next.js criado
- Docker Compose configurado
- PostgreSQL rodando
- Prisma configurado
- `schema.prisma` criado
- migration inicial executada
- banco validado

Além disso, o desenvolvimento segue a estratégia de implementação por módulos e por fases, usando este projeto como um monólito modular evolutivo. fileciteturn0file6

## Estratégia de implementação

A implementação do sistema segue esta ordem macro:

1. `auth`
2. `finance`
3. `debts`
4. `UI`
5. `PWA`

Cada módulo evolui em fases:

### Fase 1

- domain
- application
- contratos de repositório
- testes unitários

### Fase 2

- infra com Prisma
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

fileciteturn0file2

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

Esse é o formato adotado na base inicial do projeto.

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

Este projeto prioriza uma abordagem pragmática: simples no MVP, organizada desde o início e pronta para crescer com segurança.

O objetivo não é apenas criar uma aplicação funcional, mas manter uma base técnica limpa, previsível e consistente com os princípios de arquitetura definidos para o **Finance Control**.
