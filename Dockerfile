FROM node:16-alpine@sha256:2175727cef5cad4020cb77c8c101d56ed41d44fbe9b1157c54f820e3d345eab1
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]