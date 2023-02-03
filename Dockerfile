FROM node:18-alpine@sha256:cd3a299ec94fde2b46a1ef3d97db7364867e3cf372b49c7c20b5cde13d49d44e AS base
RUN apk --no-cache add dumb-init g++ gcc make python3

WORKDIR /app
ENV IS_DOCKER=true

COPY package*.json ./


# compile typescript to normal javascript

FROM base AS builder
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
RUN npm run build


# production image

FROM base AS final
RUN npm ci --omit=dev

COPY .env? ./
COPY --from=builder /app/build ./build

ENV NODE_ENV=production
ENTRYPOINT [ "dumb-init", "npm", "run" ]
CMD [ "start" ]
