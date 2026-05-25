# ⚡ PowerUP — Frontend

Interface web do e-commerce PowerUP para suplementos e produtos fitness. Construída com **Next.js 15**, **TypeScript**, **Tailwind CSS** e integração completa com a API REST do backend via cookies HttpOnly.

---

## ✨ Destaques

- 🛒 **Carrinho de compras** com persistência e migração ao logar
- 🔐 **Autenticação via cookie HttpOnly** — integração segura com o backend
- 🔄 **Refresh automático** de token em chamadas autenticadas
- ❤️ **Lista de favoritos** e histórico de pedidos
- 📦 **Gestão de perfil**: endereços, cartões e devoluções
- 🎠 **Carrossel de produtos** com Embla Carousel
- 🔔 **Notificações** em tempo real
- 🎨 **UI moderna** com Radix UI, shadcn/ui e Lucide Icons

---

## 🧭 Visão Geral da Stack

| Camada            | Tecnologia                                       |
|-------------------|--------------------------------------------------|
| **Framework**     | Next.js 15 (App Router) com Turbopack            |
| **Linguagem**     | TypeScript 5                                     |
| **Estilo**        | Tailwind CSS 4                                   |
| **Componentes**   | Radix UI · shadcn/ui · Lucide React              |
| **HTTP Client**   | Axios com interceptors de refresh automático     |
| **Formulários**   | React Hook Form + Zod                            |
| **Estado Global** | Context API (AuthContext, ProductContext)         |
| **Toasts**        | Sonner                                           |

---

## 📂 Estrutura do Projeto

```
powerup-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/          # Página de login
│   │   ├── (site)/
│   │   │   ├── page.tsx        # Home (produtos em destaque)
│   │   │   ├── carrinho/       # Carrinho de compras
│   │   │   ├── categorias/     # Listagem por categoria
│   │   │   ├── produto/        # Detalhe do produto
│   │   │   ├── mais-vendidos/  # Mais vendidos
│   │   │   ├── promocoes/      # Produtos em promoção
│   │   │   ├── meus-favoritos/ # Lista de favoritos
│   │   │   ├── meus-pedidos/   # Histórico de pedidos
│   │   │   ├── minhas-devolucoes/ # Devoluções
│   │   │   ├── finalizar-pedido/  # Checkout
│   │   │   ├── comprar-novamente/ # Recompra rápida
│   │   │   ├── notificacoes/   # Notificações
│   │   │   └── perfil/         # Dados do usuário
│   │   └── (admin)/            # Área administrativa
│   ├── components/             # Componentes reutilizáveis
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Estado de autenticação global
│   │   └── ProductContext.tsx  # Estado de produtos
│   ├── services/
│   │   └── api.ts              # Axios configurado + interceptors
│   ├── types/                  # Tipos TypeScript
│   ├── schemas/                # Schemas Zod de validação
│   ├── reducers/               # Reducers de estado
│   └── lib/                    # Utilitários
├── public/                     # Assets estáticos
├── Dockerfile
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## ✅ Requisitos

- **Node.js 18+** e **npm**

> **Docker e Docker Compose** são opcionais — necessários apenas se quiser subir toda a stack (banco + backend + frontend) de forma orquestrada.

---

## 🚀 Como Rodar

### Via Docker (Recomendado)

Toda a orquestração está no repositório do **backend**. Os dois repositórios precisam estar **lado a lado** na mesma pasta pai.

**1. Clone os repositórios:**

```bash
mkdir PowerUP && cd PowerUP
git clone https://github.com/lucasbrito0611/powerup-backend.git
git clone https://github.com/lucasbrito0611/powerup-frontend.git
```

**2. Configure o ambiente do backend:**

```bash
cd powerup-backend
cp .env.example .env
# Edite o .env e preencha SECRET_KEY e RESEND_API_KEY
```

**3. Suba todos os serviços:**

```bash
docker compose up --build
```

| Serviço  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:3000     |
| API      | http://localhost:8000     |

> O Next.js é configurado automaticamente para usar `http://localhost:8000` nas chamadas do browser e `http://backend:8000` nas chamadas SSR internas.

---

### Desenvolvimento Local (Sem Docker)

Para trabalhar apenas no frontend (o backend precisa estar rodando em `localhost:8000`):

```bash
npm install
npm run dev
```

Acesse: `http://localhost:3000`

---

## 🔐 Autenticação

O frontend utiliza um fluxo de autenticação baseado em **cookies HttpOnly**:

1. Ao fazer login, o backend retorna o JWT em um cookie HttpOnly (não acessível via JS)
2. O `AuthContext` mantém os dados do usuário no estado global
3. O `api.ts` possui interceptors que detectam erros `401` e disparam o refresh automático do token
4. Ao deslogar, o cookie é removido pelo endpoint `/logout/` da API