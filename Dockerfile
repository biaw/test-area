FROM node:16-alpine@sha256:f94079d73e46f76a250240f4d943f87998123d4b89b38a21407f1bdfa7b3e750
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]