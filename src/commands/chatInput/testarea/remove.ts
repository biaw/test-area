import { ApplicationCommandOptionType } from "discord.js";
import { matchSorter } from "match-sorter";
import type{ SecondLevelChatInputCommand } from "..";
import config from "../../../config";
import { TestArea } from "../../../database/models/TestArea";
import type{ Autocomplete } from "../../../handlers/interactions/autocompletes";
import { workers } from "../../../handlers/workers";

export default {
  name: "remove",
  description: "Remove a test area",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "server_id",
      description: "The ID of the server to remove",
      required: true,
      autocomplete: (async (query, interaction) => {
        const testAreas = await TestArea.find({ ...config.ownerId !== interaction.user.id && { ownerId: interaction.user.id } });
        return matchSorter(testAreas.map(testArea => {
          const guild = workers.get(testArea.botId)?.guilds.cache.get(testArea.serverId);
          return {
            name: guild ? `${guild.name} (${testArea.serverId})` : `unknown server ${testArea.serverId}`,
            value: testArea.serverId,
          };
        }), query, { keys: ["value", "name"] });
        // todo fix type
      }) as Autocomplete<string>,
    },
  ],
  async execute(interaction) {
    const serverId = interaction.options.getString("server_id", true);
    const testArea = await TestArea.findOne({ serverId });
    if (!testArea) return void interaction.reply({ content: "❌ This server is not a test area", ephemeral: true });

    if (testArea.ownerId !== interaction.user.id && config.ownerId !== interaction.user.id) return void interaction.reply({ content: "❌ You do not own this test area.", ephemeral: true });

    await workers.get(testArea.botId)?.guilds.cache.get(testArea.serverId)?.delete();
    await testArea.deleteOne();

    if (interaction.guildId !== serverId) void interaction.reply({ content: "✅ Test area removed.", ephemeral: true });
    return void 0;
  },
} as SecondLevelChatInputCommand;
