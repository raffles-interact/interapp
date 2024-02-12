FROM oven/bun:1.0.26
WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Singapore
RUN ln -snf /usr/share/zoneinfo/"$TZ" /etc/localtime && echo "$TZ" > /etc/timezone
RUN apt-get clean

ENV NODE_ENV development
CMD ["bun", "--watch", "scheduler/scheduler.ts"]
