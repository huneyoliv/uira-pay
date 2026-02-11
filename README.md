# Uirá Payments

Repositório Monorepo contendo Frontend e Backend.

## Estrutura do Projeto

- **`frontend/`**: Aplicação Next.js (Dashboard e Interface do Usuário).
- **`backend/`**: API NestJS (Lógica de Negócios, Integrações Crypto/Fiat, Banco de Dados).

## Como Rodar

### Backend
1. Entre na pasta: `cd backend`
2. Configure `.env` (baseado em `.env.example`)
3. Instale dependências: `npm install`
4. Rode as migrações: `npx prisma migrate dev`
5. Inicie: `npm run start:dev`

### Frontend
1. Entre na pasta: `cd frontend`
2. Configure `.env` (se necessário)
3. Instale dependências: `npm install`
4. Inicie: `npm run dev`

## Documentação Adicional
Veja o `README.md` dentro de cada pasta para detalhes específicos.
