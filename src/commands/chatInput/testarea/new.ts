import type{ BaseGuildTextChannel, PartialChannelData } from "discord.js";
import { ApplicationCommandOptionType, ChannelType, Colors, GuildDefaultMessageNotifications, PermissionFlagsBits } from "discord.js";
import type{ SecondLevelChatInputCommand } from "..";
import config from "../../../config";
import { TestArea } from "../../../database/models/TestArea";
import Worker from "../../../handlers/workers/Worker";

enum Channels { EntryLog, HumansOnly, TestChannelCategory }
enum Roles { Everyone, Owner, Operator, Bot, AdminPerms, Manager }

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
    const worker = Worker.getRandomNonFullWorker();
    if (!worker) return void interaction.reply({ content: "❌ I cannot create more test areas, no worker is available.", ephemeral: true });

    if (interaction.user.id !== config.ownerId) {
      const allOwnedTestAreas = await TestArea.countDocuments({ guild: { ownerId: interaction.user.id } });
      if (allOwnedTestAreas >= config.limitAmountOfAreasPerUser) return void interaction.reply({ content: "❌ You've exceeded the amount of testing areas. Consider deleting some before you create a new one.", ephemeral: true });
    }

    const [[guild, invite]] = await Promise.all([
      worker.client.guilds.create({
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
                deny: [PermissionFlagsBits.ViewChannel],
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
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ChangeNickname,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.CreatePrivateThreads,
              PermissionFlagsBits.CreatePublicThreads,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.RequestToSpeak,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.SendMessagesInThreads,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.Stream,
              PermissionFlagsBits.UseApplicationCommands,
              PermissionFlagsBits.UseEmbeddedActivities,
              PermissionFlagsBits.UseExternalEmojis,
              PermissionFlagsBits.UseExternalStickers,
              PermissionFlagsBits.UseVAD,
              PermissionFlagsBits.ViewAuditLog,
              PermissionFlagsBits.ViewChannel,
            ],
          },
          {
            id: Roles.Bot,
            name: "🤖",
            color: Colors.Grey,
            hoist: true,
            permissions: [],
          },
          {
            id: Roles.Operator,
            name: "🔰",
            color: Colors.Green,
            hoist: true,
            permissions: [],
          },
          {
            id: Roles.Owner,
            name: "👑",
            color: Colors.Gold,
            hoist: true,
            permissions: [],
          },
          {
            id: Roles.AdminPerms,
            name: "💥",
            color: Colors.Red,
            permissions: [PermissionFlagsBits.Administrator],
          },
          {
            id: Roles.Manager,
            name: "🔧",
            color: config.themeColor,
            hoist: true,
            permissions: [],
          },
        ],
        defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions,
        systemChannelId: Channels.EntryLog,
      })
        .then(async newTestArea => {
          // invite
          const entryChannel = newTestArea.channels.cache.find(({ name }) => name === "entry-log") as BaseGuildTextChannel;
          const newInvite = await entryChannel.createInvite({ maxAge: 0, maxUses: 0 });

          // saving to database and then returning
          await TestArea.create({
            guildId: newTestArea.id,
            ownerId: interaction.user.id,
            workerId: worker.client.user!.id,
            guild: {
              name: newTestArea.name,
              inviteCode: newInvite.code,
              roles: {
                adminId: newTestArea.roles.cache.find(({ name }) => name === "💥")!.id,
                botId: newTestArea.roles.cache.find(({ name }) => name === "🤖")!.id,
                managerId: newTestArea.roles.cache.find(({ name }) => name === "🔧")!.id,
                operatorId: newTestArea.roles.cache.find(({ name }) => name === "🔰")!.id,
                ownerId: newTestArea.roles.cache.find(({ name }) => name === "👑")!.id,
              },
            },
          });

          // rename bot and add role
          void newTestArea.members.fetchMe().then(me => void me.setNickname("Test Area Worker"));

          return [newTestArea, newInvite] as const;
        }),
      interaction.deferReply(),
    ]);

    return void interaction.editReply(`✅ Area **${guild.name}** created! Here's an invite: ${invite.url}`);
  },
} satisfies SecondLevelChatInputCommand;
