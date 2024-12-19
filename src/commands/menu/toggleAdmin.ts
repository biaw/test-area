import type { MenuCommand } from ".";
import config from "../../config";
import { TestArea } from "../../database/models/TestArea";

export default {
  name: "Toggle administrator permission",
  type: "user",
  worksIn: ["workers"],
  async execute(interaction, target) {
    const testArea = await TestArea.findOne({ guildId: interaction.guildId });
    if (
      !testArea ||
      !(
        interaction.user.id === testArea.ownerId ||
        testArea.guild.operatorIds.includes(interaction.user.id) ||
        interaction.user.id === config.ownerId
      )
    ) return void interaction.reply({ content: "❌ You're not an operator of this test area.", ephemeral: true });

    const member = "client" in target! ? target : await interaction.guild!.members.fetch(target!.user.id);
    if (member.id === interaction.client.user.id) return void interaction.reply({ content: "❌ The test area worker cannot become an admin.", ephemeral: true });

    if (member.roles.cache.has(testArea.guild.roles.adminId)) {
      await member.roles.remove(testArea.guild.roles.adminId, `Toggled by ${interaction.user.displayName}`);
      return void interaction.reply({ content: `✅ ${member.toString()} no longer has administrator in this test area.`, ephemeral: true });
    }

    await member.roles.add(testArea.guild.roles.adminId, `Toggled by ${interaction.user.displayName}`);
    return void interaction.reply({ content: `✅ ${member.toString()} now has administrator in this test area.`, ephemeral: true });
  },
} satisfies MenuCommand;
