FROM node:16-alpine@sha256:06f9a824fafa95ee7be07e24e68e47633a95c3bb0f9ae4a0839e99ad9499042c
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]