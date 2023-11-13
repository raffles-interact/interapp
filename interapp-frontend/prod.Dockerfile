FROM oven/bun:1.0.11
WORKDIR /app

COPY . .

RUN bun install

RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]