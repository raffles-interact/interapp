FROM oven/bun:1.0.17-slim
WORKDIR /app

COPY . .

ENV NODE_ENV development
ENV WATCHPACK_POLLING true
ENV CHOKIDAR_USEPOLLING true
RUN bun install --frozen-lockfile


EXPOSE 3000
CMD ["bun", "run", "dev"]