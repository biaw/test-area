FROM node:16-alpine@sha256:c23ebe44ddb93e89e753ff6a1a52a15495c3c7b7174c49b53a44a46ebc5c0caf
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]