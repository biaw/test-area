import { Client, IntentsBitField, Options, Partials } from "discord.js";
import type{ Caches } from "discord.js";
import config from "./config";
import { connection } from "./database";
import { discordLogger } from "./utils/logger/discord";
import handleInteractions from "./handlers/interactions";
import handleMentionCommands from "./handlers/mentionCommands";
import { inspect } from "util";
import { mainLogger } from "./utils/logger/main";

const client = new Client({
  allowedMentions: { parse: [], users: [], roles: [], repliedUser: true },
  intents: [
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
  ],
  makeCache: Options.cacheWithLimits({
    ApplicationCommandManager: 0,
    AutoModerationRuleManager: 0,
    BaseGuildEmojiManager: 0,
    GuildBanManager: 0,
    GuildEmojiManager: 0,
    GuildForumThreadManager: 0,
    GuildInviteManager: 0,
    GuildMemberManager: 0,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    GuildStickerPackManager: 0,
    GuildTextThreadManager: 0,
    MessageManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    UserManager: 0,
    VoiceStateManager: 0,
  } as Record<keyof Caches, number>),
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
  presence: { status: "online" },
  rest: { userAgentAppendix: "Bot Name (bot repository) " },
  ws: { compress: true },
});

// init client
client.once("ready", trueClient => {
  mainLogger.info(`Logged in as ${trueClient.user.tag}!`);

  handleInteractions(trueClient);
  handleMentionCommands(trueClient);
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
void connection.then(() => void client.login(config.client.token));
