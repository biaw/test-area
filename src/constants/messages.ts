import { InteractionReplyOptions } from "discord.js";

export const permissionError: InteractionReplyOptions = {
  content: "❌ You do not have permission to do that.",
  ephemeral: true,
};
