FROM node:16-alpine@sha256:b66869a9dc6bfeed416395c2a2f717bd1779af1cef828fe7941af3a8d0837fdc
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]