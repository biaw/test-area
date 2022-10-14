FROM node:16-alpine@sha256:66ad21bf5c87492a08f3e86e1e8a2778a78d1662fb6576c288b06fdd99935e12
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]