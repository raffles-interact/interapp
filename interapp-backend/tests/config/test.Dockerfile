FROM oven/bun:1.0.11
WORKDIR /app

COPY  . . 

RUN bun install

EXPOSE 1234
CMD ["bun", "run", "api/routes/index.ts"]
