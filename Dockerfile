# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.3.0

FROM node:${NODE_VERSION}-bullseye-slim as base

# Needed to have the package show up in GitHub
LABEL org.opencontainers.image.source=https://github.com/ucsd-its-sd/snowbot3

# For cleanliness
WORKDIR /home/snowbot

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Build the application, binding the required files.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
    --mount=type=bind,source=src/,target=src/ \
    npm run build

COPY ./entry.sh /home/snowbot/entry.sh

# Run the application.
ENTRYPOINT [ "/home/snowbot/entry.sh" ]