FROM oven/bun:1.0.14
WORKDIR /app

RUN bun install node-cron

COPY . .

CMD ["bun", "--watch", "scheduler.ts"]
