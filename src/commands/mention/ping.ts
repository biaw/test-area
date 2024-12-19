import type{ MentionCommand } from ".";
import { msToHumanShortTime } from "../../utils/time";

export default {
  names: ["ping", "pong", ""],
  worksIn: ["test-areas", "non-test-areas"],
  testArgs(args) { return args.length === 0; },
  async execute(message, reply) {
    const start = Date.now();
    const [[botMessage, messageLatency], gatewayLatency] = await Promise.all([
      reply("〽️ Pinging...").then(newMessage => [newMessage, Date.now() - start] as const),
      message.client.rest.get("/gateway").then(() => Date.now() - start),
    ]);

    return void botMessage.edit(`🏓 Message latency is \`${messageLatency}ms\`, gateway latency is \`${gatewayLatency}ms\` and my uptime is \`${msToHumanShortTime(message.client.uptime)}\`.`);
  },
} satisfies MentionCommand;
