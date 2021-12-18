import { SlashCommand } from "../../../@types/interactions";
import { TextChannel } from "discord.js";
import { areas } from "../../../utils/database";

export type CommandArgs = {
  name: string;
  channels?: number;
}

export default (async (interaction, { name, channels = 5 }: CommandArgs, { slash, success, error }) => {
  if (interaction.client.guilds.cache.size >= 10) return interaction.reply(`${error} I can't create more testing areas, I've reached Discord's limit of 10 guilds per bot.`);

  await interaction.deferReply();

  const guild = await interaction.client.guilds.create(name, {
    channels: [
      {
        id: 1000,
        name: "❗setup-commands❗",
        permissionOverwrites: [
          {
            id: 2000,
            deny: ["VIEW_CHANNEL"],
          },
        ],
      },
      {
        id: 1001,
        name: "entry-log",
      },
      {
        id: 1002,
        name: "humans-only",
        permissionOverwrites: [
          {
            id: 2002,
            deny: ["VIEW_CHANNEL"],
          },
        ],
      },
      {
        id: 1003,
        type: "GUILD_CATEGORY",
        name: "🔨 Test Channels",
      },
      ...Array(channels).fill("placeholder").map((_, i) => ({
        name: `test-channel-${i + 1}`,
        parentId: 1003,
      })),
    ],
    defaultMessageNotifications: "ONLY_MENTIONS",
    roles: [
      {
        id: 2000,
        name: "everyone",
        permissions: [
          "ADD_REACTIONS",
          "VIEW_AUDIT_LOG",
          "VIEW_CHANNEL",
          "SEND_MESSAGES",
          "EMBED_LINKS",
          "ATTACH_FILES",
          "READ_MESSAGE_HISTORY",
          "USE_EXTERNAL_EMOJIS",
          "CONNECT",
          "SPEAK",
          "USE_VAD",
          "CHANGE_NICKNAME",
          "USE_APPLICATION_COMMANDS",
          "REQUEST_TO_SPEAK",
          "USE_EXTERNAL_STICKERS",
          "SEND_MESSAGES_IN_THREADS",
          "START_EMBEDDED_ACTIVITIES",
        ],
      },
      {
        id: 2001,
        name: "👍",
        hoist: true,
        permissions: [],
      },
      {
        id: 2002,
        name: "👑",
        hoist: true,
        permissions: [],
      },
      {
        id: 2003,
        name: "🤖",
        color: "GREY",
        hoist: true,
        permissions: [],
      },
      {
        id: 2004,
        name: "💥",
        color: "RED",
        permissions: ["ADMINISTRATOR"],
      },
    ],
    systemChannelId: 1001,
  });

  const [setup, entry] = [
    guild.channels.cache.find(c => c.name === "❗setup-commands❗"),
    guild.channels.cache.find(c => c.name === "entry-log"),
  ] as Array<TextChannel>;

  setup.send({
    content: `${slash} To set up slash commands in this server, please authorize me: ${interaction.client.generateInvite({
      scopes: ["applications.commands"],
      guild,
      disableGuildSelect: true,
    })}`,
    components: [
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "BUTTON",
            label: "Done",
            customId: "_area-commands-setup",
            style: "SUCCESS",
          },
        ],
      },
    ],
  });

  const invite = await entry.createInvite({ maxAge: 0 });

  await areas.set(guild.id, {
    ownerId: interaction.user.id,
    elevated: [],
    roles: {
      elevated: guild.roles.cache.find(r => r.name === "👍")?.id || "",
      owner: guild.roles.cache.find(r => r.name === "👑")?.id || "",
      bot: guild.roles.cache.find(r => r.name === "🤖")?.id || "",
      admin: guild.roles.cache.find(r => r.name === "💥")?.id || "",
    },
    inviteCode: invite.code,
  });

  interaction.editReply(`${success} Area **${name}** created! Here's an invite: ${invite.url}`);
}) as SlashCommand["execute"];
