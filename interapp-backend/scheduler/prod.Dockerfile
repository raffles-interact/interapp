FROM oven/bun:1.0.14
WORKDIR /app

COPY . .

RUN bun install

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Singapore
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


CMD ["bun", "run", "scheduler/scheduler.ts"]
