import type { MenuCommand } from ".";
import config from "../../config";
import { TestArea } from "../../database/models/TestArea";

export default {
  name: "Toggle operator",
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

    const member = "client" in target! ? target : await interaction.guild!.members.fetch(target!.user.id);
    if (member.id === interaction.user.id) return void interaction.reply({ content: "❌ The owner cannot become an operator.", ephemeral: true });
    if (member.id === interaction.client.user.id) return void interaction.reply({ content: "❌ The test area worker cannot become an operator.", ephemeral: true });
    if (member.user.bot) return void interaction.reply({ content: "❌ A bot cannot become an operator.", ephemeral: true });

    if (testArea.guild.operatorIds.includes(member.id)) {
      testArea.guild.operatorIds.splice(testArea.guild.operatorIds.indexOf(member.id), 1);
      void interaction.reply({ content: `✅ ${member.toString()} is no longer an operator.`, ephemeral: true });
    } else {
      testArea.guild.operatorIds.push(member.id);
      void interaction.reply({ content: `✅ ${member.toString()} is now an operator.`, ephemeral: true });
    }

    return void await testArea.save();
  },
} satisfies MenuCommand;
