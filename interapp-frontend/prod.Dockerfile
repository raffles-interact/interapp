FROM node:20-alpine
WORKDIR /app

COPY . .

ENV NODE_ENV production
# RUN npm cache clear --force
RUN npm install --frozen-lockfile
RUN set -e; npm run build 2>&1 | tee /tmp/build.log; \
    if [ $? -ne 0 ]; then \
        cat /tmp/build.log; \
        exit 1; \
    fi

EXPOSE 3000
CMD ["npm", "run", "start"]