# ============================================================
# Stage 1: builder — все зависимости, генерация Prisma Client, сборка TS
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# --schema напрямую указывает на схему → prisma.config.ts не нужен для generate
RUN npx prisma generate --schema prisma/schema.prisma \
 && npm run build

# Конфиг нужен только для migrate deploy (сервис migrate использует этот стейдж)
COPY prisma.config.ts ./

# ============================================================
# Stage 2: production — только то, что нужно для работы приложения
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
 && npm cache clean --force

# Скомпилированное приложение
COPY --from=builder /app/dist ./dist

# Сгенерированный Prisma Client (результат prisma generate)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER node

CMD ["node", "dist/main.js"]
