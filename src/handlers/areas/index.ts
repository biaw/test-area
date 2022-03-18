import type { Handler } from "../../@types/handler";
import { areas } from "../../utils/database";
import { components } from "../interactions/component";
import { registerCommands } from "./commands";
import { updateRoles } from "./roles";

export default (client => {
  areas.get().then(async areaList => {
    for (const guildId in areaList) {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return;

      const members = await guild.members.fetch();
      for (const member of Array.from(members.values())) {
        await updateRoles(member, areaList[guildId]);
      }
    }
  });

  client.on("guildMemberAdd", async member => {
    const area = await areas.get(member.guild.id);
    if (area) updateRoles(member, area);
  });

  const scheduledUpdates = new Map<string, NodeJS.Timeout>();
  client.on("guildMemberUpdate", async (_, member) => {
    const area = await areas.get(member.guild.id);
    if (!area) return;

    const update = () => {
      updateRoles(member, area);
      scheduledUpdates.delete(member.id);
    };

    const scheduled = scheduledUpdates.get(member.id);
    if (scheduled) clearTimeout(scheduled);

    scheduledUpdates.set(member.id, setTimeout(update, 5000));
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
