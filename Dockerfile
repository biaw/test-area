FROM node:16-alpine@sha256:7584b116f368d94fab2ecc21ebbcfd5434a3427c2f96f846972821b5ad0266fc
RUN apk add dumb-init g++ gcc make python3

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

CMD ["dumb-init", "npm", "start"]