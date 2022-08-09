FROM node:16-alpine@sha256:319f098302bcbf6273fab6627c0af487cf9f21063c9283495f33d17d616cfc34
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]