FROM node:16-alpine@sha256:308e8c2ceed9182ac9f937ad166978eaab7d30ea2fe9202b24bf1fdaea34d431
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]