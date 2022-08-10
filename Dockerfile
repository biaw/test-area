FROM node:16-alpine@sha256:1c8769a8c9ed57817ef07162744a3722421333a438185c560aa42a9a1fc6ea23
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]