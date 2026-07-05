FROM node:22.23-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:22.23-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

ENV PORT=4321
ENV HOST=0.0.0.0

CMD ["node", "dist/server/entry.mjs"]