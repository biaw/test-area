FROM node:16-alpine@sha256:afa007fd9ed55e78a01998d79197c5f2d586b806ed031a595f4fbb25db03a607
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]