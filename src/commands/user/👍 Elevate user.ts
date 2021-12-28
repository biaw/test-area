import { UserCommand } from "../../@types/interactions";
import { areas } from "../../utils/database";

export default {
  execute: async interaction => {
    const area = await areas.get(interaction.guildId as string);
    if (!area) return;

    if (interaction.targetId === area.ownerId) {
      return interaction.reply({
        content: "❌ You can't elevate the owner.",
        ephemeral: true,
      });
    }

    if (area.elevated.includes(interaction.targetId)) {
      area.elevated = area.elevated.filter(id => id !== interaction.targetId);
      interaction.guild?.members.fetch(interaction.targetId).then(member => member.roles.remove(area.roles.elevated));
      interaction.reply({
        content: `✅ User <@${interaction.targetId}> is no longer elevated.`,
        ephemeral: true,
      });
    } else {
      area.elevated.push(interaction.targetId);
      interaction.guild?.members.fetch(interaction.targetId).then(member => member.roles.add(area.roles.elevated));
      interaction.reply({
        content: `✅ User <@${interaction.targetId}> is now elevated.`,
        ephemeral: true,
      });
    }

    areas.set(interaction.guildId as string, area);
  },
  areaPermissionLevel: "OWNER",
} as UserCommand;
