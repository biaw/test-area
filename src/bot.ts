import { discordLogger, testAreaLogger } from "./utils/logger";
import { Client } from "discord.js";
import { areas } from "./utils/database";
import config from "./config";
import { join } from "path";
import { readdir } from "fs";

const client = new Client({
  partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
  userAgentSuffix: [
    `Responsible is ${config.DISCORD_OWNER_ID}`,
    "Source: https://github.com/biaw/test-area",
  ],
  intents: ["GUILDS", "GUILD_MEMBERS"],
});

client.once("ready", trueClient => {
  testAreaLogger.info(`Discord client is connected as ${trueClient.user.tag}! Add me using this link: ${trueClient.generateInvite({
    scopes: ["applications.commands"],
  })}`);

  // get all files in ./handlers and run them
  readdir(join(__dirname, "handlers"), (err, files) => {
    if (err) throw err;
    files.forEach(async file => (await import(join(__dirname, "handlers", file))).default(trueClient));
  });


  setInterval(() => areas.get().then(async list => {
    const invalidGuilds = Object.keys(list).filter(id => !client.guilds.resolve(id));
    for (const guild of invalidGuilds) await areas.delete(guild);

    const current = Object.values(list).length - invalidGuilds.length;
    const maximum = 10 - (client.guilds.cache.size - current); // calculate maximum possible test areas

    trueClient.user.setPresence({
      status: "online",
      activities: [
        {
          type: "WATCHING",
          name: `${current}/${maximum} testing areas`,
        },
      ],
    });
  }), 60000);
});

client
  .on("debug", info => void discordLogger.debug(info))
  .on("error", error => void discordLogger.error(`Cluster errored. ${JSON.stringify({ ...error })}`))
  .on("rateLimit", rateLimitData => void discordLogger.warn(`Rate limit ${JSON.stringify(rateLimitData)}`))
  .on("ready", () => void discordLogger.info("All shards have been connected."))
  .on("shardDisconnect", (event, id) => void discordLogger.warn(`Shard ${id} disconnected. ${JSON.stringify({ ...event })}`))
  .on("shardError", (error, id) => void discordLogger.error(`Shard ${id} errored. ${JSON.stringify({ ...error })}`))
  .on("shardReady", id => void discordLogger.info(`Shard ${id} is ready.`))
  .on("shardReconnecting", id => void discordLogger.warn(`Shard ${id} is reconnecting.`))
  .on("shardResume", (id, replayed) => void discordLogger.info(`Shard ${id} resumed. ${replayed} events replayed.`))
  .on("warn", info => void discordLogger.warn(info))
  .login(config.DISCORD_TOKEN);
