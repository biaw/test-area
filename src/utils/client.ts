import type { Caches } from "discord.js";
import { Client, IntentsBitField, Options, Partials } from "discord.js";

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
  rest: { userAgentAppendix: "Test Area (https://github.com/biaw/test-area)" },
});

export default client;
