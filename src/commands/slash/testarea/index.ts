import subcommandCreate, { CommandArgs as SubcommandCreateArgs } from "./create";
import { SlashCommand } from "../../../@types/interactions";
import { areas } from "../../../utils/database";

type CommandArgs = {
  create?: SubcommandCreateArgs;
  list?: Record<string, never>;
  delete?: {
    guild: string;
  }
}

export default {
  description: "Manage area access",
  options: [
    {
      type: "SUB_COMMAND",
      name: "create",
      description: "Create a new area",
      options: [
        {
          type: "STRING",
          name: "name",
          description: "The name of the area",
          required: true,
        },
        {
          type: "INTEGER",
          name: "channels",
          description: "The number of test channels to create",
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "list",
      description: "List all areas",
    },
    {
      type: "SUB_COMMAND",
      name: "delete",
      description: "Delete an area",
      options: [
        {
          type: "STRING",
          name: "guild",
          description: "The guild to delete",
          required: true,
        },
      ],
    },
  ],
  execute: async (interaction, { create, list, delete: _delete }: CommandArgs, { slash, success, error, blank }) => {
    if (create) return subcommandCreate(interaction, create, { slash, success, error });
    if (list) {
      const areaList = await areas.get();

      const guilds = interaction.client.guilds.cache.filter(g => Object.keys(areaList).includes(g.id));
      if (!guilds.size) return interaction.reply(`${error} No areas found.`);

      return interaction.reply({
        content: `${success} You have ${guilds.size}/${10 - (interaction.client.guilds.cache.size - guilds.size)} testing areas created.`,
        embeds: await Promise.all(guilds.map(async guild => {
          const users = await guild.members.fetch();
          const members = users.filter(m => !m.user.bot).sort((a, b) => {
            if (a.id === areaList[guild.id].ownerId) return -1;
            if (b.id === areaList[guild.id].ownerId) return 1;
            if (areaList[guild.id].elevated.includes(a.id)) return -1;
            if (areaList[guild.id].elevated.includes(b.id)) return 1;
            return 0;
          });

          return {
            title: `${guild.name} (\`${guild.id}\`)`,
            description: `${interaction.client.options.http?.invite}/${areaList[guild.id].inviteCode} - created by <@${areaList[guild.id].ownerId}> <t:${Math.round(guild.createdTimestamp / 1000)}:R>`,
            fields: [
              {
                name: "Humans",
                value: members.map(member => {
                  let emoji = blank;
                  if (member.id === areaList[guild.id].ownerId) emoji = "👑";
                  else if (areaList[guild.id].elevated.includes(member.id)) emoji = "👍";

                  return `${emoji} <@${member.id}>`;
                }).join("\n") || "*None*",
                inline: true,
              },
              {
                name: "Bots",
                value: users.filter(m => m.user.bot && m.id !== interaction.client.user?.id).map(member => `<@${member.id}>`).join("\n") || "*None*",
                inline: true,
              },
            ],
            color: parseInt(guild.id) % 0xFFFFFF, // random color
          };
        })),
      });
    }
    if (_delete) {
      const guild = interaction.client.guilds.cache.get(_delete.guild);
      if (!guild) return interaction.reply(`${error} Area doesn't exist.`);

      await guild.delete();
      await areas.delete(guild.id);
      return interaction.reply(`${success} Area deleted.`);
    }
  },
  globalPermissionLevel: "ACCESS",
} as SlashCommand;
