import type { Caches, Snowflake } from "discord.js";
import type { Logger } from "winston";
import { Client, IntentsBitField, Options, Partials } from "discord.js";
import { objects, predicates } from "friendly-words";
import { inspect } from "util";
import config from "../../config";
import { workerLogger } from "../../utils/logger/discord";
import mainLogger from "../../utils/logger/main";
import handleInteractions from "../interactions";
import handleMentionCommands from "../mentionCommands";

export default class Worker {
  public static workers = new Map<Snowflake, Worker>();
  public static get nonFullWorkers(): Worker[] {
    return Array.from(this.workers.values()).filter(worker => worker.client.guilds.cache.size < 10);
  }

  public readonly client: Client;
  public readonly logger: Logger;

  public get workerName(): string {
    const workerNumber = Number(this.workerId);
    const workerIndent = workerNumber % (objects.length * predicates.length);
    return `${predicates[workerIndent % predicates.length]!} ${objects[Math.floor(workerIndent / predicates.length)]!}`;
  }

  private readonly token: string;
  private readonly workerId: Snowflake;

  public constructor(token: string) {
    this.client = new Client({
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
        GuildMemberManager: Infinity,
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
        UserManager: Infinity,
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

    this.workerId = Buffer.from(token.split(".")[0]!, "base64").toString("ascii");
    this.logger = workerLogger(this.workerName);
    this.token = token;

    Worker.workers.set(this.workerId, this);

    // init client
    this.client.once("ready", trueClient => {
      mainLogger.info(`Worker "${this.workerName}" logged in as ${this.workerName}#${trueClient.user.discriminator}!`);

      handleInteractions(trueClient, this.workerName);
      handleMentionCommands(trueClient, this.workerName);

      if (!config.noGeneratedNames && trueClient.user.username !== this.workerName) {
        void trueClient.user.edit({ username: this.workerName });
        this.logger.info(`Renamed worker to match worker name. (${this.workerName})`);
      }
    });

    // discord debug logging
    this.client
      .on("cacheSweep", message => void this.logger.debug(message))
      .on("debug", info => void this.logger.debug(info))
      .on("error", error => void this.logger.error(`Client errored. ${inspect(error)}`))
      .on("rateLimit", rateLimitData => void this.logger.warn(`Rate limit: ${JSON.stringify(rateLimitData)}`))
      .on("ready", () => void this.logger.info("All shards have been connected."))
      .on("warn", info => void this.logger.warn(info));
  }

  public static getRandomNonFullWorker(): null | Worker {
    return this.nonFullWorkers[Math.floor(Math.random() * this.nonFullWorkers.length)] ?? null;
  }

  public async login(): Promise<void> {
    return void await this.client.login(this.token);
  }
}
