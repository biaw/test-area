import { inspect } from "util";
import config from "./config";
import connection from "./database";
import handleInteractions from "./handlers/interactions";
import handleMentionCommands from "./handlers/mentionCommands";
import handleWorkers from "./handlers/workers";
import client from "./utils/client";
import discordLogger from "./utils/logger/discord";
import mainLogger from "./utils/logger/main";

// init client
client.once("ready", trueClient => {
  mainLogger.info(`Logged in as ${trueClient.user.tag}!`);

  handleInteractions(trueClient);
  handleMentionCommands(trueClient);
  handleWorkers();
});

// discord debug logging
client
  .on("cacheSweep", message => void discordLogger.debug(message))
  .on("debug", info => void discordLogger.debug(info))
  .on("error", error => void discordLogger.error(`Cluster errored. ${inspect(error)}`))
  .on("rateLimit", rateLimitData => void discordLogger.warn(`Rate limit ${JSON.stringify(rateLimitData)}`))
  .on("ready", () => void discordLogger.info("All shards have been connected."))
  .on("shardDisconnect", (_, id) => void discordLogger.warn(`Shard ${id} disconnected.`))
  .on("shardError", (error, id) => void discordLogger.error(`Shard ${id} errored. ${inspect(error)}`))
  .on("shardReady", id => void discordLogger.info(`Shard ${id} is ready.`))
  .on("shardReconnecting", id => void discordLogger.warn(`Shard ${id} is reconnecting.`))
  .on("shardResume", (id, replayed) => void discordLogger.info(`Shard ${id} resumed. ${replayed} events replayed.`))
  .on("warn", info => void discordLogger.warn(info));

// other debug logging
process
  .on("uncaughtException", error => mainLogger.warn(`Uncaught exception: ${inspect(error)}`))
  .on("unhandledRejection", error => mainLogger.warn(`Unhandled rejection: ${inspect(error)}`));

// log in
void connection.then(() => void client.login(config.clientToken));
