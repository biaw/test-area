[![Test build](https://img.shields.io/github/workflow/status/biaw/test-area/Build%20and%20publish)](https://github.com/biaw/test-area/actions/workflows/build-and-publish.yml)
[![Linting](https://img.shields.io/github/workflow/status/biaw/test-area/Linting?label=quality)](https://github.com/biaw/test-area/actions/workflows/linting.yml)
[![Analysis and Scans](https://img.shields.io/github/workflow/status/biaw/test-area/Analysis%20and%20Scans?label=scan)](https://github.com/biaw/test-area/actions/workflows/analysis-and-scans.yml)
[![DeepScan grade](https://deepscan.io/api/teams/16173/projects/19537/branches/509655/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16173&pid=19537&bid=509655)
[![discord.js version](https://img.shields.io/github/package-json/dependency-version/biaw/test-area/discord.js)](https://www.npmjs.com/package/discord.js)
[![GitHub Issues](https://img.shields.io/github/issues-raw/biaw/test-area.svg)](https://github.com/biaw/test-area/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr-raw/biaw/test-area.svg)](https://github.com/biaw/test-area/pulls)

# test-area

A Discord bot to easily create testing servers, without having to worry about writing in that 2FA code to delete it later.

Screenshots is further down on the page.

## Usage examples

- This is mostly for users that needs their own testing server, but can't be bothered to create a new one and later on write the 2FA code to delete it.
- Bot developers that need an emoji server for their bot can also use this, just create a testing area and use it as an emoji server. You can also leave the server, and it won't be deleted unless you delete it yourself.

## Setup

### Requirements

You will need:
- a Discord bot set up (https://discord.dev)
- some patience as global slash commands might take up to an hour to cache

### Setting up using Docker

With Docker, you don't even need to download anything. Fill in the environment variables and you should be able to run the commands below. See the [`example.env`](https://github.com/biaw/test-area/blob/master/example.env)-file for more information on what to fill these values with.

Having a log volume is optional, it's mostly for development and debugging. A database volume is required though, as we store information like whitelisted users etc.

#### Linux

```cmd
docker run --name test-area \
  -e "DISCORD_TOKEN=" \
  -e "DISCORD_OWNER_ID=" \
  -v /test-area/database:/app/database \
  -v /test-area/logs:/app/logs \
  ghcr.io/biaw/test-area:latest
```

#### Windows

```cmd
docker run --name test-area ^
  -e "DISCORD_TOKEN=" ^
  -e "DISCORD_OWNER_ID=" ^
  -v "C:\test-area\database":/app/database ^
  -v "C:\test-area\logs":/app/logs ^
  ghcr.io/biaw/test-area:latest
```

## Screenshots

### Easily create and manage testing areas
![](https://i.imgur.com/LLVnbss.png)

### Toggle admin and elevate users

- Toggling admin gives the user "ADMINISTRATOR" permissions in the testing area.
- Elevating someone means they can give themselves and other users admin permissions. Only the owner of the testing area can elevate users.

![](https://i.imgur.com/TNGkab7.png)

### An example of a testing area
![](https://i.imgur.com/SpevNWU.png)