# SNOWbot

## Running (without clone)

This requires [the Docker engine](https://www.docker.com/products/docker-desktop/).

To run the bot, execute `scripts/start.sh`, where `./config/` contains a file `config.json` with at least

```json
{
  "token": "<token>"
}
```

`<token>` being replaced by the bot's token.

To update the image, run `scripts/pull.sh`.

## Contributing

If you just cloned the repository, you'll want to run `npm install` to have type hints and other development niceties (VSCode recommended). You should also install the relevant Prettier extension to your IDE, so that you follow the same formatting guidelines.

To build locally, run `scripts/build.sh`. Then run as above.

You'll need to authenticate in order to push the package; I recommend using [the GitHub client](https://cli.github.com/). You can also [manually make a personal access token](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry) with GitHub if you prefer, but it is easier to use `gh`:

```sh
gh auth login -s read:packages,write:packages
gh config get -h github.com oauth_token | docker login ghcr.io -u <username> --password-stdin
```

To push the package, run `scripts/push.sh` after building.
