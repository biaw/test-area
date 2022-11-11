FROM node:16-alpine@sha256:296dd8ebd5b68706cc35d85e3c5b0103b28d2c0e8fde7e2feff68e4072636d6a
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]