FROM oven/bun:1.1.7
WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile && \
    # install curl, lsb-release and gnupg
    apt-get update && apt-get install -y curl gnupg lsb-release && apt-get clean && \

    # add postgresql repository
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list && \

    # update and install postgresql-client-16, tzdata
    apt-get update && apt-get install -y --fix-missing postgresql-client-16 tzdata && apt-get clean && \

    ARCH=$(case "$(uname -m)" in "x86_64") echo "amd64";; "ppc64le") echo "ppc64le";; *) echo "Unsupported architecture"; exit 1;; esac) && \
    DOWNLOAD_URL=$(case "$ARCH" in "amd64") echo "https://dl.min.io/cxlient/mc/release/linux-amd64/mc";; "ppc64le") echo "https://dl.min.io/client/mc/release/linux-ppc64le/mc";; *) echo "Unsupported architecture"; exit 1;; esac) && \  
    # Install wget to download MinIO client
    apt-get update && apt-get install -y wget && \
    # Download MinIO client binary
    wget -O /usr/local/bin/mc "$DOWNLOAD_URL" && \
    # Make MinIO client binary executable
    chmod +x /usr/local/bin/mc && \
    # Clean up
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    # Output success message
    echo "MinIO client installed successfully."

ENV TZ=Asia/Singapore
RUN ln -snf /usr/share/zoneinfo/"$TZ" /etc/localtime && echo "$TZ" > /etc/timezone
RUN apt-get clean

ENV NODE_ENV development
CMD ["bun", "--watch", "scheduler/scheduler.ts"]
