#!/bin/bash

# Entrypoint for Docker container; drops privileges after fixing bind mount permissions

useradd snowbot

chown -R snowbot:snowbot /home/snowbot

su snowbot

exec node dist/main.js