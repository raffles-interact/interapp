FROM oven/bun:1.0.14
WORKDIR /app

COPY . . 
RUN bun install

EXPOSE 3000
CMD ["bun", "run", "api/routes/index.ts"]
