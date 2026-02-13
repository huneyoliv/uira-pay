# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Add native dependencies if needed for OCI SDK (usually not needed for pure JS sdk but good to have)
# RUN apk add --no-cache python3 make g++

# Add compat-openssl1.1 for Prisma
RUN apk add --no-cache compat-openssl1.1

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
