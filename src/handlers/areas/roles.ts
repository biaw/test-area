import { Area } from "../../@types/area";
import { GuildMember } from "discord.js";

export function updateRoles(member: GuildMember, area: Area) {
  let roles = Array.from(member.roles.cache.keys());
  const { length } = roles;

  if (member.user.id === area.ownerId) roles.push(area.roles.owner, area.roles.admin);
  else roles = roles.filter(r => r !== area.roles.owner && r !== area.roles.admin);

  if (area.elevated.includes(member.user.id)) roles.push(area.roles.elevated);
  else roles = roles.filter(r => r !== area.roles.elevated);

  if (member.user.bot) roles.push(area.roles.bot);
  else roles = roles.filter(r => r !== area.roles.bot);

  roles = roles.filter((r, i, a) => a.indexOf(r) === i); // filter duplicates

  if (roles.length !== length) return member.roles.set(roles, "Update area roles");

  return Promise.resolve(member);
}
