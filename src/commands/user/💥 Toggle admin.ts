import type { UserCommand } from "../../@types/interactions";
import { areas } from "../../utils/database";

export default {
  execute: async interaction => {
    const area = await areas.get(interaction.guildId as string);
    const member = await interaction.guild?.members.fetch(interaction.targetId);
    if (!area || !member) return;

    if (member.roles.cache.has(area.roles.admin)) {
      member.roles.remove(area.roles.admin, `Admin removed by ${interaction.user.tag}`);
      interaction.reply({
        content: interaction.targetId === interaction.user.id ? "✅  You're no longer an admin." : `✅  User <@${interaction.targetId}> is no longer an admin.`,
        ephemeral: true,
      });
    } else {
      member.roles.add(area.roles.admin, `Admin added by ${interaction.user.tag}`);
      interaction.reply({
        content: interaction.targetId === interaction.user.id ? "✅  You're now an admin." : `✅ User <@${interaction.targetId}> is now an admin.`,
        ephemeral: true,
      });
    }
  },
  areaPermissionLevel: "ELEVATED",
} as UserCommand;
