FROM oven/bun:1.0.11
WORKDIR /app

COPY package.json .
COPY bun.lockb .
COPY tsconfig.json .

RUN bun install

COPY . . 


EXPOSE 3000
CMD ["bun", "run", "api/routes/index.ts"]
