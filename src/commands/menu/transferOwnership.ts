import type { MenuCommand } from ".";
import config from "../../config";
import { TestArea } from "../../database/models/TestArea";

export default {
  name: "Transfer ownership",
  type: "user",
  worksIn: ["workers"],
  async execute(interaction, target) {
    const testArea = await TestArea.findOne({ guildId: interaction.guildId });
    if (
      !testArea ||
      !(
        interaction.user.id === testArea.ownerId ||
        interaction.user.id === config.ownerId
      )
    ) return void interaction.reply({ content: "❌ You're not the owner of this test area.", ephemeral: true });

    if (interaction.targetId === interaction.user.id) return void interaction.reply({ content: "❌ You doofus.", ephemeral: true });
    const member = "client" in target! ? target : await interaction.guild!.members.fetch(target!.user.id);
    if (member.id === interaction.client.user.id) return void interaction.reply({ content: "❌ The test area worker cannot become the owner.", ephemeral: true });
    if (member.user.bot) return void interaction.reply({ content: "❌ A bot cannot become the owner of a test area.", ephemeral: true });

    testArea.ownerId = member.id;
    await testArea.save();

    return void interaction.reply({ content: `✅ The new owner of this test area is now ${member.toString()}!`, ephemeral: true });
  },
} satisfies MenuCommand;
