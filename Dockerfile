FROM node:16-alpine@sha256:e2423ec956aaee105fd85084c9e5cbbfbc49339a79aaa95b6568e16b3ed6efb3
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]