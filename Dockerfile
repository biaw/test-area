FROM node:16-alpine@sha256:a827cdb24276b0a7a325d9ed30092a18a9854c27b03fd40c994e901d3ca7db3f
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]