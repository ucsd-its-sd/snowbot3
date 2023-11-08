# SNOWbot

## Running (without clone)

This requires both [the Docker engine](https://www.docker.com/products/docker-desktop/) and [the GitHub client](https://cli.github.com/). 
You can also manually make a personal access token with GitHub if you prefer, but it is easier to use `gh`.

To authenticate for pulling Docker images from GitHub Container Repository, run:

```sh
gh auth login -s read:packages
gh config get -h github.com oauth_token | docker login ghcr.io -u <username> --password-stdin
```

To run the bot, execute `docker run --name snowbot3 --env-file env.list ghcr.io/j613/snowbot3:latest`, where `env.list` contains

```sh
DISCORD_TOKEN=<token>
```

with `<token>` replaced by the bot's token.

## Contributing

When logging in, do the same as the above, but when using `gh`, add the `write:packages` scope.

```sh
gh auth login -s read:packages,write:packages
gh config get -h github.com oauth_token | docker login ghcr.io -u <username> --password-stdin
```

To build locally, run `docker build . -t ghcr.io/j613/snowbot3:latest`. Then run as above.

To push the package, run `docker push ghcr.io/j613/snowbot3:latest` after building.
