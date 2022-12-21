import type{ ChatInput } from ".";
import { msToHumanShortTime } from "../../utils/time";

export default {
  name: "ping",
  description: "Ping the bot",
  async execute(interaction) {
    const now = Date.now();
    await interaction.deferReply();
    return void interaction.editReply(`🏓 Server latency is \`${Date.now() - now}ms\`, shard latency is \`${Math.ceil(interaction.guild.shard.ping)}ms\` and my uptime is \`${msToHumanShortTime(interaction.client.uptime)}\`.`);
  },
} as ChatInput;
