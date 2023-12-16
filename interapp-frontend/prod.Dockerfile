FROM oven/bun:1.0.18
WORKDIR /app

COPY . .


ENV NODE_ENV production
RUN bun install --frozen-lockfile
RUN bun run build


EXPOSE 3000
CMD ["bun", "run", "start"]