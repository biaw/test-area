import type { SlashCommand } from "../../@types/interactions";
import { inspect } from "util";

export default {
  description: "Run JavaScript code",
  options: [
    {
      type: "STRING",
      name: "code",
      description: "The code you want to run",
      required: true,
    },
    {
      type: "BOOLEAN",
      name: "plaintext",
      description: "Output in plain text",
    },
  ],
  execute: async (interaction, { code, plaintext = false }: { code: string; plaintext?: boolean; }) => {
    let replied: Promise<void> | undefined;
    try {
      const evaled = eval(code);
      if (evaled instanceof Promise) {
        const start = Date.now();
        replied = interaction.deferReply();
        return evaled.then(async result => {
          const time = Date.now() - start;
          const output = typeof result !== "string" ? inspect(result) : result;

          await replied;
          interaction.editReply(plaintext ? output : `✅ Evaluated successfully. (\`${time}ms\`) \`\`\`js\n${output}\`\`\``);
        });
      }

      const output = typeof evaled !== "string" ? inspect(evaled) : evaled;
      return interaction.reply(plaintext ? output : `✅ Evaluated successfully. \`\`\`js\n${output}\`\`\``);
    } catch (e) {
      const err = typeof e === "string" ? e.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`) : e;

      const content = `❌ JavaScript failed.\n\`\`\`fix\n${err}\`\`\``;
      if (replied) {
        await replied;
        interaction.editReply(content);
      } else interaction.reply(content);
    }
  },
  globalPermissionLevel: "OWNER",
} as SlashCommand;
