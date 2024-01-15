FROM oven/bun:1.0.20
WORKDIR /app

COPY  . . 

ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH 0
RUN bun install --frozen-lockfile

EXPOSE 1234
CMD ["bun", "run", "--watch", "api/routes/index.ts"]
