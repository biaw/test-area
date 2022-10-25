FROM node:16-alpine@sha256:842770ef089fcb7c3bc40fcbf2b1f80fd2361558d4950f03f24444767265e613
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]