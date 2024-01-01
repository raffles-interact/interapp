FROM oven/bun:1.0.20
WORKDIR /app

COPY . .

RUN bun install --production --frozen-lockfile

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Singapore
RUN ln -snf /usr/share/zoneinfo/"$TZ" /etc/localtime && echo "$TZ" > /etc/timezone
RUN apt-get clean

ENV NODE_ENV production
CMD ["bun", "run", "scheduler/scheduler.ts"]
