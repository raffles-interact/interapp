FROM oven/bun:1.0.10
WORKDIR /app

COPY package.json .
COPY bun.lockb .
COPY tsconfig.json .

RUN bun install

COPY . . 

# initialise database
RUN bun run db/init.ts 

EXPOSE 3000
CMD ["bun", "--watch", "api/routes/index.ts"]
