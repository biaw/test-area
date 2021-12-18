import { Handler } from "../../@types/handler";
import { areas } from "../../utils/database";
import { components } from "../interactions/component";
import { registerCommands } from "./commands";

export default (client => {
  client.on("guildMemberAdd", async member => {
    const area = await areas.get(member.guild.id);
    if (area) {
      const roles: Array<string> = [];

      if (member.user.id === area.ownerId) roles.push(area.roles.owner, area.roles.admin);
      if (area.elevated.includes(member.user.id)) roles.push(area.roles.elevated);
      if (member.user.bot) roles.push(area.roles.bot);

      if (roles.length) await member.roles.add(roles);
    }
  });
}) as Handler;

components.set("_area-commands-setup", {
  allowedUsers: null,
  callback: async i => {
    if (!i.guild) return;

    const success = await registerCommands(i.guild);
    if (!success) {
      return i.reply({
        content: "❌ Failed to register commands.",
        ephemeral: true,
      });
    }

    await i.update({});
    i.channel?.delete();
  },
});
