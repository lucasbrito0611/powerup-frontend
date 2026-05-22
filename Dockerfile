# Usa uma imagem oficial estável do Node.js
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de mapeamento de dependências primeiro
COPY package*.json ./

# Instala as dependências do projeto (inclusive as de desenvolvimento)
RUN npm install

# Copia todo o restante do código do frontend
COPY . .

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Define a variável para o Next.js aceitar conexões externas dentro do container
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar o Next.js em modo de desenvolvimento com hot-reload
CMD ["npm", "run", "dev"]