# ⚡ PowerUP — Frontend

Interface web do e-commerce PowerUP para suplementos e produtos fitness. Construída com **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**, painel administrativo corporativo com **Refine.dev** e integração completa com a API REST do backend via cookies HttpOnly e **Google OAuth 2.0**.

---

## ✨ Destaques

- 👑 **Painel Administrativo Completo com Refine.dev**:
  - 📦 **Gestão de Produtos**: CRUD completo, upload de imagens (Cloudinary) e editor de texto rico (**Tiptap**)
  - 🛒 **Gestão de Pedidos**: listagem paginada, filtros por status, cancelamento e alteração de status em tempo real
  - ⏳ **Controle de Lotes & Estoque**: monitoramento de validade, alertas de estoque crítico e exclusão em massa de vencidos
  - 🔄 **Gestão de Devoluções**: análise, aprovação e recusa de solicitações com fotos
  - 🔔 **Envio de Notificações**: disparos de comunicados e alertas para clientes do sistema
- 🌐 **Login Social com Google** via Google Identity Services (`@react-oauth/google`)
- 🔐 **Autenticação Segura via Cookie HttpOnly**: tokens protegidos contra XSS e mutex de refresh automático em requisições concorrentes
- 🔑 **Fluxo Completo de Recuperação de Senha**: páginas dedicadas para solicitação e redefinição com validação de força de senha
- 🛒 **Carrinho de Compras Inteligente**: persistência local com migração transparente ao autenticar
- 📝 **Formulários Robustos**: validação de esquemas com Zod, React Hook Form e máscaras de entrada (CPF, Telefone, CEP)
- ❤️ **Experiência do Cliente**: favoritos, histórico detalhado de pedidos, solicitação de devoluções, carteira de cartões e múltiplos endereços
- 🎨 **UI Moderna e Acessível**: componentes baseados em Radix UI, feedback visual com Sonner e ícones Lucide

---

## 🧭 Visão Geral da Stack

| Camada | Tecnologia |
| :--- | :--- |
| **Framework Web** | Next.js 15 (App Router) com Turbopack · React 19 |
| **Linguagem** | TypeScript 5 |
| **Estilização** | Tailwind CSS 4 · Radix UI · Lucide React |
| **Painel Administrativo** | Refine.dev (`@refinedev/core`, `@refinedev/nextjs-router`, `@refinedev/simple-rest`) · TanStack Table |
| **Autenticação Social** | Google Identity Services (`@react-oauth/google`) |
| **Editor de Texto** | Tiptap (`@tiptap/react`, `@tiptap/starter-kit`) |
| **Comunicação HTTP** | Axios com Interceptors de Refresh Token automático |
| **Formulários & Validação** | React Hook Form · Zod |
| **Gerenciamento de Estado** | React Context API (`AuthContext`, `ProductContext`) |
| **Carrosséis & Notificações** | Embla Carousel · Sonner (Toasts) |

---

## 📂 Estrutura do Projeto

```
powerup-frontend/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   └── admin/                  # Painel Administrativo (Refine)
│   │   │       ├── produtos/           # Listagem, criação e edição de produtos
│   │   │       ├── pedidos/            # Gestão e acompanhamento de pedidos
│   │   │       ├── lotes/              # Controle de validade e lotes de estoque
│   │   │       ├── devolucoes/         # Análise de devoluções
│   │   │       ├── notificacoes/       # Disparo de notificações aos clientes
│   │   │       └── perfil/             # Perfil do administrador
│   │   ├── (auth)/
│   │   │   ├── login/                  # Login tradicional e Google OAuth
│   │   │   ├── cadastro/               # Cadastro de novos clientes com validações
│   │   │   └── recuperar/              # Solicitação e redefinição de senha
│   │   │       └── [uid]/[token]/      # Link seguro com token Djoser
│   │   └── (site)/                     # Loja Pública / E-commerce
│   │       ├── page.tsx                # Página inicial (Destaques, Mais Vendidos, Promoções)
│   │       ├── produto/[id]/           # Detalhe do produto e avaliações
│   │       ├── categorias/[tipo]/      # Listagem filtrada por categoria
│   │       ├── carrinho/               # Carrinho de compras e resumo de valores
│   │       ├── finalizar-pedido/       # Checkout com seleção de endereço e pagamento
│   │       ├── meus-pedidos/           # Histórico de pedidos
│   │       │   └── [id]/               # Detalhes do pedido e solicitação de devolução
│   │       ├── minhas-devolucoes/      # Acompanhamento de devoluções
│   │       ├── meus-favoritos/         # Lista de desejos / favoritos
│   │       ├── comprar-novamente/      # Recompra rápida de itens já adquiridos
│   │       ├── notificacoes/           # Central de notificações do cliente
│   │       └── perfil/                 # Gerenciamento de perfil
│   │           ├── meus-enderecos/     # Cadastro e edição de endereços de entrega
│   │           └── minha-carteira/     # Cartões de crédito salvos
│   ├── components/                     # Componentes modulares reutilizáveis
│   ├── contexts/
│   │   ├── AuthContext.tsx             # Estado de autenticação global e dados do usuário
│   │   └── ProductContext.tsx          # Estado e carregamento de produtos
│   ├── services/
│   │   └── api.ts                      # Instância Axios + Interceptors de refresh mutex
│   ├── schemas/                        # Schemas Zod de validação de formulários
│   ├── types/                          # Interfaces e tipos TypeScript
│   └── lib/                            # Helpers e utilitários gerais
├── public/                             # Imagens e assets estáticos
├── .env.example                        # Modelo de variáveis de ambiente
├── next.config.ts                      # Configuração do Next.js e domínios de imagens
├── package.json                        # Scripts e dependências
└── tsconfig.json                       # Configurações do compilador TypeScript
```

---

## ✅ Requisitos

- **Node.js 18+** (recomendado Node 20 LTS)
- **npm** ou **yarn** / **pnpm**
- Backend da API em execução (localmente ou em nuvem)

---

## 🛠️ Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz de `powerup-frontend`:

```bash
cp .env.example .env.local
# No Windows (PowerShell): Copy-Item .env.example .env.local
```

Configure as variáveis necessárias:

```env
# URL base da API Django Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Client ID do Google Cloud Console (para login social com Google)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
```

> ⚠️ Em produção (ex: Vercel), defina `NEXT_PUBLIC_API_URL` com o domínio da API no Render/Cloud (ex: `https://powerup-api.onrender.com`).

---

## 🚀 Como Rodar

### 1. Via Docker Compose (Stack Completa)

Toda a orquestração multi-serviço é gerenciada a partir do repositório do **backend**. Os diretórios `powerup-backend` e `powerup-frontend` devem estar na mesma pasta pai:

```bash
cd ../powerup-backend
docker compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`

---

### 2. Desenvolvimento Local (Apenas Frontend)

Com o backend ativo na porta `8000`:

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento com Turbopack
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🔐 Fluxo de Autenticação e Segurança

1. **Login Tradicional & Google OAuth**:
   - No login comum, credenciais são enviadas via `POST /login/`.
   - No login Google, o token emitido pelo Google Identity Services é enviado para `POST /auth/google/`.
   - O backend valida e retorna os tokens JWT dentro de **cookies HttpOnly** seguros (`access_token` e `refresh_token`), evitando armazenamento vulnerável em `localStorage`.
2. **Sessão Global (`AuthContext`)**:
   - Mantém os dados cadastrais do cliente (`user`), estado de carregamento e permissão administrativa (`is_staff`).
3. **Interceptor & Mutex de Refresh (`api.ts`)**:
   - Em caso de expiração do access token (`401 Unauthorized`), o interceptor pausa as requisições pendentes, solicita renovação silenciosa via cookie para `/refresh/` e repete as requisições originais de forma transparente.
4. **Logout Seguro**:
   - O endpoint `/logout/` invalida o token no backend e expira os cookies no navegador.