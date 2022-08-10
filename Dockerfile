FROM node:16-alpine@sha256:7f6b81abe71e4de65f09b4ad1913e17fc7f354efbbbcfd35370deaa41d3a07f2
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]