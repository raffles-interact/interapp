FROM oven/bun:1.20.24
WORKDIR /app

COPY . . 

RUN bun install --frozen-lockfile
ENV NODE_ENV development

EXPOSE 3000
CMD ["bun", "--watch", "api/routes/index.ts"]
