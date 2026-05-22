# PowerUP - Frontend

Este é o frontend do projeto PowerUP, construído com Next.js. O projeto foi configurado para rodar de forma integrada com o backend via Docker Compose.

## 🚀 Requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados na máquina.
- Repositório do backend clonado lado a lado com este repositório.

## 🛠️ Como Rodar (Via Docker)

Toda a orquestração dos containers (banco de dados, backend e frontend) fica no repositório do **backend**. Para rodar a aplicação completa, siga os passos abaixo:

### 1. Estrutura de Pastas

É **obrigatório** que os dois repositórios estejam na mesma pasta pai. O docker-compose do backend busca o frontend no diretório vizinho.

```bash
mkdir PowerUP && cd PowerUP
git clone https://github.com/lucasbrito0611/powerup-backend.git
git clone https://github.com/lucasbrito0611/powerup-frontend.git
```

### 2. Configurar o Ambiente do Backend

```bash
cd powerup-backend
cp .env.example .env  # No Windows (CMD), use: copy .env.example .env
# Preencha as chaves no arquivo .env antes de subir
```

### 3. Iniciar a Aplicação

Ainda dentro de `powerup-backend`, inicie o Docker Compose:

```bash
docker compose up --build
```

Acesse o site em: `http://localhost:3000`

> O Next.js já está configurado no docker-compose para utilizar a URL correta da API, seja acessando pelo seu navegador (`NEXT_PUBLIC_API_URL=http://localhost:8000`) ou fazendo requisições SSR internamente no servidor (`API_URL=http://backend:8000`).

## 💻 Desenvolvimento Local (Sem Docker)

Caso queira trabalhar apenas no frontend localmente (necessita do backend rodando em `localhost:8000`):

```bash
npm install
npm run dev
```
