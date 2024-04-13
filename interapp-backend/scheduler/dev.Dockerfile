FROM oven/bun:1.1.3
WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

# install curl, lsb-release and gnupg
RUN apt-get update && apt-get install -y curl lsb-release gnupg && apt-get clean

# add postgresql repository
RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list

# update and install postgresql-client-16, tzdata
RUN apt-get update && apt-get install -y postgresql-client-16 tzdata && apt-get clean

ENV TZ=Asia/Singapore
RUN ln -snf /usr/share/zoneinfo/"$TZ" /etc/localtime && echo "$TZ" > /etc/timezone
RUN apt-get clean

ENV NODE_ENV development
CMD ["bun", "--watch", "scheduler/scheduler.ts"]
