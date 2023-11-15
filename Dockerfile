# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.9.0

FROM node:${NODE_VERSION}-alpine

# Needed to have the package show up in GitHub
LABEL org.opencontainers.image.source=https://github.com/ucsd-its-sd/SNOWbot3

# For cleanliness
WORKDIR /usr/snowbot

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY . .

# Build the application.
RUN ["npm", "run", "build"]

# Run the application as a non-root user.
USER node

# Run the application.
CMD ["npm", "run", "start"]
