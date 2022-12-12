FROM node:16-alpine@sha256:3265e41b5007254a593a1c3ff8b9b5ea9b943d63a1360a7d8d7d29b33a46a01f
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]