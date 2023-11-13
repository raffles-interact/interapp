FROM oven/bun:1.0.11
WORKDIR /app

COPY . . 

RUN bun install

EXPOSE 3000
CMD ["bun", "--watch", "api/routes/index.ts"]
