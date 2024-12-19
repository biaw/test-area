import { ApplicationCommandOptionType } from "discord.js";
import { matchSorter } from "match-sorter";
import type{ SecondLevelChatInputCommand } from "..";
import config from "../../../config";
import { TestArea } from "../../../database/models/TestArea";

export default {
  name: "remove",
  description: "Remove a test area",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "server_id",
      description: "The ID of the server to remove",
      required: true,
      autocomplete: async (query, interaction) => {
        const testAreas = await TestArea.find({ ...config.ownerId !== interaction.user.id && { ownerId: interaction.user.id } });
        return matchSorter(testAreas.map(testArea => ({
          name: testArea.discordGuild ? `${testArea.guild.name} (${testArea.guildId})` : `unknown server ${testArea.guildId}`,
          value: testArea.guildId,
        })), query, { keys: ["value", "name"] });
      },
    },
  ],
  async execute(interaction) {
    const guildId = interaction.options.getString("server_id", true);
    const testArea = await TestArea.findOne({ guildId });
    if (!testArea) return void interaction.reply({ content: "❌ This server is not a test area", ephemeral: true });

    if (testArea.ownerId !== interaction.user.id && config.ownerId !== interaction.user.id) return void interaction.reply({ content: "❌ You do not own this test area.", ephemeral: true });

    await testArea.discordGuild?.delete();
    await testArea.deleteOne();

    return void (interaction.guildId !== guildId && interaction.reply({ content: "✅ Test area removed.", ephemeral: true }));
  },
} satisfies SecondLevelChatInputCommand;
