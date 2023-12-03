FROM oven/bun:1.0.15
WORKDIR /app

COPY  . . 

RUN bun install --frozen-lockfile

EXPOSE 1234
CMD ["bun", "run", "api/routes/index.ts"]
