FROM oven/bun:1.1.7
WORKDIR /app

COPY . . 
RUN bun install --production --frozen-lockfile
ENV NODE_ENV production

EXPOSE 3000
CMD ["bun", "run", "api/routes/index.ts"]
