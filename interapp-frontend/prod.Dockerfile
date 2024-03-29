FROM node:20-alpine
WORKDIR /app

COPY . .


ENV NODE_ENV production
# RUN npm cache clear --force
RUN npm install --frozen-lockfile
RUN npm run build 2>&1 | tee /tmp/build.log 


EXPOSE 3000
CMD ["npm", "run", "start"]