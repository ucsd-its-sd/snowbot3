# SNOWbot

## Running (without clone)

This requires [the Docker engine](https://www.docker.com/products/docker-desktop/).

To run the bot, execute `docker run --name snowbot3 -v ./config:/usr/snowbot/config --rm ghcr.io/ucsd-its-sd/snowbot3:latest`, where `config/` contains a file `config/config.json` with at least

```json
{
  "token": "<token>"
}
```

`<token>` being replaced by the bot's token.

## Contributing

If you just cloned the repository, you'll want to run `npm install` to have type hints and other development niceties (VSCode recommended). You should also install the relevant Prettier extension to your IDE, so that you follow the same formatting guidelines.

To build locally, run `docker build . -t ghcr.io/ucsd-its-sd/snowbot3:latest` (`-t` tags the build for pushing later). Then run as above.

You'll need to authenticate in order to push the package; I recommend using [the GitHub client](https://cli.github.com/). You can also [manually make a personal access token](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry) with GitHub if you prefer, but it is easier to use `gh`:

```sh
gh auth login -s read:packages,write:packages
gh config get -h github.com oauth_token | docker login ghcr.io -u <username> --password-stdin
```

To push the package, run `docker push ghcr.io/ucsd-its-sd/snowbot3:latest` after building.
