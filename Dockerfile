FROM node:18-alpine@sha256:c7bd8f1cdb3c6d7333cbbe63a86ad149759cbea52c18466c00848058ecfeee4d AS base
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
