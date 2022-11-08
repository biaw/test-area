FROM node:16-alpine@sha256:cc234ef6c5c5cd79c8a48d6dfeeaa5ebf0709927a233f6ea695563769902a350
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]