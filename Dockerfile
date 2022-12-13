FROM node:16-alpine@sha256:1f1936c8b6dd11a194f4e7f041a59aed1060abab267a0a7c09757f42a48d0e6c
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]