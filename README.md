# 🤖 brianbot

this repository contains the code for the powerful **brianbot**.

## 📋 features

this bot acts as a global/headless notification system for the nominations game. it works both on **XMTP** and **Farcaster** (via casts that tags the @brianbot).

it's extremely scalable due to the usage of **Redis** queues if enabled, allowing the bot to handle multiple requests at the same time without any issues whatsoever.

## 📦 installation

to install the bot, you need to follow these steps:

1. clone the repository

```bash
git clone https://github.com/talentprotocol/brianbot.git
cd brianbot
```

2. install the dependencies using your package manager of choice

```bash
npm install # using npm
yarn install # using yarn
pnpm install # using pnpm
bun install # using bun
```

3. copy the `.env.example` file to `.env` and fill in the required fields. check the **configuration** section below for more information

```bash
cp .env.example .env
```

4. build and start the bot

```bash
npm run build && npm run start # using npm
yarn build && yarn start # using yarn
pnpm build && pnpm start # using pnpm
bun run build && bun run start # using bun
```

the bot should be running in the port of your choice (or `3000` if default).

in production enviroments it's better to use a process manager like **PM2** to keep the bot running in the background.

```bash
npm install -g pm2
npm run build && pm2 start dist/index.js --name brianbot # using npm
yarn build && pm2 start dist/index.js --name brianbot # using yarn
pnpm build && pm2 start dist/index.js --name brianbot # using pnpm
```

## ⚙️ configuration

the only configuration needed for this bot is the `.env` file. here's a list of all the required environment variables:

```bash
NEYNAR_API_KEY="" # neynar farcaster API key
FARCASTER_SIGNER_UUID="" # neynar farcaster signer UUID
FARCASTER_CHANNEL_ID="" # /shopycast farcaster channel ID
PORT="3000" # api port (default "3000", can be omitted)

XMTP_ENV="dev" # XMTP environment (default "dev", can be omitted)

# BUILDBOT params
BRIANBOT_WARPCAST_API_KEY="wc_secret_567..." # warpcast api key for sending direct casts using brianbot
BRIANBOT_WEBHOOK_NAME="" # name of the webhook for the brianbot (e.g. "brianbot_webhook") that needs to be published for sending casts and replies
BRIANBOT_WEBHOOK_TARGET_BASE_URL="" # target BASE URL for the webhook (e.g. ngrok|| prod url)
BRIANBOT_FARCASTER_FID="" # farcaster fid of the brianbot (used to check mentions)
BRIANBOT_XMTP_PRIVATE_KEY="" # brianbot XMTP private key (used for sending XMTP messages)
```

if you want to enable the **Redis** queues, you need to add the following environment variables:

```bash
REDIS_HOST="" # redis host
REDIS_PORT="" # redis port
```

this will allow the bot to connect to your Redis instance and start using the queues. if the queues are not enabled, the bot will work as a normal **Express** server and send the messages istantly. **this is not recommended for production environments**.

## 📡 webhooks

the bot uses webhooks to receive messages from the **BUILD API** by using a shared secret. this secret is defined in the `.env` file as `WEBHOOK_KEY`. if a request is made to any of the `/webhooks` endpoints without such key, it will result in a `401 Unauthorized` response.

### `POST /webhooks/nominations`

this endpoint is used to receive the nominations from warpcast and to generate a tx from the cast.

```

## 📝 license

this project is licensed under the **MIT License**. check the [LICENSE.md](/LICENSE.md) file for more information.
