FROM node:20-alpine
WORKDIR /app

COPY . .

ENV NODE_ENV development
ENV WATCHPACK_POLLING true
RUN npm install --frozen-lockfile


EXPOSE 3000
CMD ["npm", "run", "dev"]