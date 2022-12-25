import type{ Awaitable, Message, MessageReplyOptions } from "discord.js";
import { join } from "path";
import { readdirSync } from "fs";

export interface MentionCommand {
  names: [string, ...string[]];
  ownerOnly?: true;
  worksIn: Array<"non-test-areas" | "test-areas">;
  testArgs(args: string[]): boolean;
  execute(message: Message<true>, reply: (content: MessageReplyOptions | string) => Promise<Message>, args: string[]): Awaitable<void>;
}

export const quickResponses: Array<[
  triggers: [string, ...string[]],
  response: string,
]> = [];

export const allMentionCommands = readdirSync(join(__dirname, "../commands/mention"))
  .filter(file => !file.includes("index") && (file.endsWith(".js") || file.endsWith(".ts")))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- we need this for it to be synchronous
  .map(file => require(join(__dirname, "../commands/mention", file)).default as MentionCommand);
