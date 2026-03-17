# Stage 1: Build Vite App
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Argumentos utilitários em build-time
ARG NEXT_PUBLIC_DOMAIN
ENV VITE_API_DOMAIN=$NEXT_PUBLIC_DOMAIN

RUN npm run build

# Stage 2: Serve with Nginx for Production (Multi-arch nativa)
FROM nginx:alpine

# Altera a porta padrao do Nginx de 80 para 3000 a fim de manter a compatibilidade do Compose
RUN sed -i 's/listen  *80;/listen 3000;/' /etc/nginx/conf.d/default.conf

# Configura o Nginx para lidar com roteamento de SPA (Single Page Application) redirecionando tudo ao index.html
RUN sed -i '/location \/ {/a \        try_files $uri $uri/ /index.html;' /etc/nginx/conf.d/default.conf

# Copia os dados do build pro container Nginx
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
