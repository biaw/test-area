import { ButtonStyle, ComponentType } from "discord.js";
import type{ FirstLevelChatInputCommand } from ".";
import config from "../../config";
import { TestArea } from "../../database/models/TestArea";
import { buttonComponents } from "../../handlers/interactions/components";

export default {
  name: "self_destruct",
  description: "Delete the server",
  applicableTo: ["workers"],
  async execute(interaction) {
    const testArea = await TestArea.findOne({ guildId: interaction.guildId });
    if (interaction.user.id !== testArea?.ownerId && interaction.user.id !== config.ownerId) return interaction.reply({ content: "❌ You are not the owner of this test area.", ephemeral: true });

    buttonComponents.set(`${interaction.id}:confirm`, {
      allowedUsers: [interaction.user.id],
      async callback(button) {
        await button.deferUpdate();
        await testArea?.discordGuild?.delete();
      },
    });

    return void interaction.reply({
      content: "⚠️ Are you sure you want to delete this server? This action cannot be undone.",
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              customId: `${interaction.id}:confirm`,
              label: "Confirm",
              style: ButtonStyle.Danger,
            },
          ],
        },
      ],
    });
  },
} as FirstLevelChatInputCommand;
