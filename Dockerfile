FROM node:16-alpine@sha256:b9e3244a692a1e4fea97938e073a6563ebd88b88cb0c033bf9719c2bc1e79b58
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]