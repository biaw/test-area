import type { SlashCommand } from "../../@types/interactions";
import { access } from "../../utils/database";

type CommandArgs = {
  grant?: {
    user: string;
  };
  list?: Record<string, never>;
  revoke?: {
    user: string;
  }
}

export default {
  description: "Manage area access",
  options: [
    {
      type: "SUB_COMMAND",
      name: "grant",
      description: "Grant someone access to use this bot and create test areas themselves",
      options: [
        {
          type: "USER",
          name: "user",
          description: "The user you want to grant access to",
          required: true,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "list",
      description: "List all users with access",
    },
    {
      type: "SUB_COMMAND",
      name: "revoke",
      description: "Revoke someone's access to use this bot and create test areas themselves",
      options: [
        {
          type: "USER",
          name: "user",
          description: "The user you want to revoke access from",
          required: true,
        },
      ],
    },
  ],
  execute: async (interaction, { grant, list, revoke }: CommandArgs) => {
    if (grant) {
      const { user } = grant;
      await access.set(user, true);
      interaction.reply(`✅ Successfully granted access to <@${user}>.`);
    }

    if (list) {
      const users = Object.keys(await access.get());
      interaction.reply(`✅ Users with access: (${users.length})\n${users.map(id => `• <@${id}>`).join("\n")}`);
    }

    if (revoke) {
      const { user } = revoke;
      await access.delete(user);
      interaction.reply(`✅ Successfully revoked access from <@${user}>.`);
    }
  },
  globalPermissionLevel: "OWNER",
} as SlashCommand;
