FROM node:22-alpine@sha256:5340cbfc2df14331ab021555fdd9f83f072ce811488e705b0e736b11adeec4bb AS base
RUN apk --no-cache add g++ gcc make python3
WORKDIR /app

# install prod dependencies

FROM base AS deps

# corepack has had issues with pnpm in earlier versions, and since we only use corepack to download pnpm then we can safely use the latest version
RUN \
  npm i -g corepack@latest \
  corepack enable pnpm

COPY pnpm-lock.yaml package.json .npmrc ./
RUN pnpm install --frozen-lockfile --prod


# install all dependencies and build typescript

FROM deps AS ts-builder
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY ./src ./src
RUN pnpm run build


# production image

FROM base

COPY .env* ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=ts-builder /app/build ./build
COPY package.json ./

ENV NODE_ENV=production
ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
