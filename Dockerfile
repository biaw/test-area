FROM node:16-alpine@sha256:da32af0cf608622b1550678b2552b7d997def7d0ada00e0eca0166ed2ea42186
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]