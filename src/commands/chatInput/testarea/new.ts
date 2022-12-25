import { ApplicationCommandOptionType, ChannelType, GuildDefaultMessageNotifications } from "discord.js";
import type{ BaseGuildTextChannel, PartialChannelData } from "discord.js";
import type{ SecondLevelChatInputCommand } from "..";
import { TestArea } from "../../../database/models/TestArea";
import { workers } from "../../../handlers/workers";

enum Channels { EntryLog, HumansOnly, TestChannelCategory }
enum Roles { Everyone, Owner, Bot, AdminPerms, Manager }

export default {
  name: "new",
  description: "Create a new test area",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "name",
      description: "The name of the test area",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "test_channels",
      description: "The number of test channels to create (default: 3)",
      required: false,
    },
  ],
  async execute(interaction) {
    const worker = Array.from(workers.values()).find(({ guilds }) => guilds.cache.size < 10);
    if (!worker) return void interaction.reply({ content: "❌ I cannot create more test areas, no worker is available.", ephemeral: true });

    const [[guild, invite]] = await Promise.all([
      worker.guilds.create({
        name: interaction.options.getString("name", true),
        channels: [
          {
            id: Channels.EntryLog,
            name: "entry-log",
          },
          {
            id: Channels.HumansOnly,
            name: "humans-only",
            permissionOverwrites: [
              {
                id: Roles.Bot,
                deny: ["ViewChannel"],
              },
            ],
          },
          {
            id: Channels.TestChannelCategory,
            type: ChannelType.GuildCategory,
            name: "🔨 Test Channels",
          },
          ...Array.from<never[], PartialChannelData>({ length: interaction.options.getInteger("test_channels", false) ?? 3 }, (_, i) => ({ name: `test-channel-${i + 1}`, parentId: Channels.TestChannelCategory })),
        ],
        roles: [
          {
            id: Roles.Everyone,
            name: "everyone",
            permissions: [
              "AddReactions",
              "AttachFiles",
              "ChangeNickname",
              "Connect",
              "CreatePrivateThreads",
              "CreatePublicThreads",
              "EmbedLinks",
              "ReadMessageHistory",
              "RequestToSpeak",
              "SendMessages",
              "SendMessagesInThreads",
              "Speak",
              "Stream",
              "UseApplicationCommands",
              "UseEmbeddedActivities",
              "UseExternalEmojis",
              "UseExternalStickers",
              "UseVAD",
              "ViewAuditLog",
              "ViewChannel",
            ],
          },
          {
            id: Roles.Owner,
            name: "👑",
            color: "Gold",
            hoist: true,
            permissions: [],
          },
          {
            id: Roles.Bot,
            name: "🤖",
            color: "Grey",
            hoist: true,
            permissions: [],
          },
          {
            id: Roles.AdminPerms,
            name: "💥",
            color: "Red",
            hoist: true,
            permissions: ["Administrator"],
          },
          {
            id: Roles.Manager,
            name: "🔧",
            color: "Blurple",
            hoist: true,
            permissions: [],
          },
        ],
        defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
        systemChannelId: Channels.EntryLog,
      })
        .then(async newTestArea => {
          const entryChannel = newTestArea.channels.cache.find(({ name }) => name === "entry-log") as BaseGuildTextChannel;
          const newInvite = await entryChannel.createInvite({ maxAge: 0, maxUses: 0 });
          await TestArea.create({
            serverId: newTestArea.id,
            botId: worker.user.id,
            ownerId: interaction.user.id,
          });
          return [newTestArea, newInvite] as const;
        }),
      interaction.deferReply(),
    ]);

    return void interaction.editReply(`✅ Area **${guild.name}** created! Here's an invite: ${invite.url}`);
  },
} as SecondLevelChatInputCommand;
