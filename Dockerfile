FROM node:16-alpine@sha256:88d9d8da697877a4a771a40e5cbc10a12c2ad959e82f3b0f36ef35635e17f693
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]