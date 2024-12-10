import type{ Caches, Guild, GuildMember, Snowflake } from "discord.js";
import { Client, IntentsBitField, Options, Partials } from "discord.js";
import { objects, predicates } from "friendly-words";
import { inspect } from "util";
import config from "../config";
import { TestArea } from "../database/models/TestArea";
import { workerLogger } from "../utils/logger/discord";
import mainLogger from "../utils/logger/main";
import handleInteractions from "./interactions";
import handleMentionCommands from "./mentionCommands";

export const workers = new Map<Snowflake, Client<true>>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- // todo use client
export default function handleWorkers(_client: Client<true>): void {
  void initWorkers().then(() => mainLogger.info("Workers initialized."));
}

async function initWorkers(): Promise<void> {
  for (const token of config.workerTokens) {
    const worker = new Client({
      allowedMentions: { parse: [], users: [], roles: [], repliedUser: true },
      intents: [
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
      ],
      makeCache: Options.cacheWithLimits({
        ApplicationCommandManager: 0,
        AutoModerationRuleManager: 0,
        BaseGuildEmojiManager: 0,
        DMMessageManager: 0,
        GuildBanManager: 0,
        GuildEmojiManager: 0,
        GuildForumThreadManager: 0,
        GuildInviteManager: 0,
        GuildMemberManager: 0,
        GuildMessageManager: 0,
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
      rest: { userAgentAppendix: "Test Area Worker (https://github.com/biaw/test-area)" },
    });

    const workerId = Buffer.from(token.split(".")[0]!, "base64").toString("ascii");

    const workerName = getWorkerUniqueName(workerId);
    const discordLogger = workerLogger(workerName);

    // init client
    worker.once("ready", trueWorker => {
      mainLogger.info(`Worker "${workerName}" logged in as ${trueWorker.user.tag}!`);

      handleInteractions(trueWorker, workerName);
      handleMentionCommands(trueWorker, workerName);
      workers.set(workerId, trueWorker);
    });

    // discord debug logging
    worker
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

    // trigger guild activity update -- we really only need the message create event for this
    worker.on("messageCreate", message => updateGuildActivity(message.guild!));

    // give roles upon joining the server
    worker.on("guildMemberAdd", member => updateRoles(member));

    // log in
    await worker.login(token);
  }
}

function getWorkerUniqueName(workerId: Snowflake): string {
  const workerNumber = Number(workerId);
  const workerIndent = workerNumber % (objects.length * predicates.length);
  return `${predicates[workerIndent % predicates.length]!} ${objects[Math.floor(workerIndent / predicates.length)]!}`;
}

function updateGuildActivity(guild: Guild): void {
  void TestArea.findOne({ serverId: guild.id })
    .then(testArea => {
      if (testArea) {
        testArea.lastActivityAt = new Date();
        void testArea.save();
      }
    });
}

function updateRoles(member: GuildMember): void {
  void TestArea.findOne({ serverId: member.guild.id })
    .then(testArea => {
      if (testArea) {
        const roles = [];
        if (testArea.ownerId === member.id) roles.push(testArea.roles.ownerId, testArea.roles.adminId);
        if (member.user.bot) roles.push(testArea.roles.botId);
        if (roles.length) void member.roles.add(roles);
      }
    });
}
