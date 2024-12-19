import type{ FirstLevelChatInputCommand } from ".";
import { msToHumanShortTime } from "../../utils/time";

export default {
  name: "ping",
  description: "Ping the bot",
  applicableTo: ["main", "workers"],
  async execute(interaction) {
    const start = Date.now();
    const [interactionLatency, gatewayLatency] = await Promise.all([
      interaction.deferReply().then(() => Date.now() - start),
      interaction.client.rest.get("/gateway").then(() => Date.now() - start),
    ]);

    return void interaction.editReply(`🏓 Interaction latency is \`${interactionLatency}ms\`, gateway latency is \`${gatewayLatency}ms\` and my uptime is \`${msToHumanShortTime(interaction.client.uptime)}\`.`);
  },
} satisfies FirstLevelChatInputCommand;
