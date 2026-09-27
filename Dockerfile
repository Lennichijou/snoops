FROM node:22.23-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --package-lock-only --no-audit --no-fund \
 && npm ci --no-audit --no-fund

COPY . .

RUN npm run build

FROM node:22.23-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4321
ENV HOST=0.0.0.0

COPY --from=builder /app/package.json /app/package-lock.json ./

RUN npm install --omit=dev --no-audit --no-fund \
 && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]