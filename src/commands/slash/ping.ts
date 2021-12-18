import { SlashCommand } from "../../@types/interactions";
import { msToTime } from "../../utils/time";

export default {
  description: "Ping the bot",
  execute: async (interaction, _, { connection }) => {
    const start = Date.now();
    await interaction.deferReply();
    interaction.editReply(`${connection} Server latency is \`${Date.now() - start}ms\`, API latency is \`${interaction.client.ws.ping}ms\` and my uptime is \`${msToTime(interaction.client.uptime || 0)}\`.`);
  },
  globalPermissionLevel: "ALL",
} as SlashCommand;
