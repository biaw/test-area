import type{ APIEmbed, GuildMember, Interaction, InteractionReplyOptions, InteractionUpdateOptions } from "discord.js";
import { ButtonStyle, Colors, ComponentType, time, TimestampStyles } from "discord.js";
import type{ SecondLevelChatInputCommand } from "..";
import { TestArea } from "../../../database/models/TestArea";
import { buttonComponents, selectMenuComponents } from "../../../handlers/interactions/components";
import { workers } from "../../../handlers/workers";

export default {
  name: "list",
  description: "List all the test areas",
  async execute(interaction) {
    return void interaction.reply(await generateMessage(interaction));
  },
} as SecondLevelChatInputCommand;

enum Filter { none, active1d, active1w, active1m, active6m, stale1d, stale1w, stale1m, stale6m, ownerIsMe, ownerIsNotMe }
enum Sort { none, creationDateAscending, creationDateDescending, nameAZ, nameZA, ownerAZ, ownerZA }

const entriesPerPage = 5;

async function generateMessage(interaction: Interaction, filter: Filter = Filter.none, sort: Sort = Sort.none, page = 0): Promise<InteractionReplyOptions & InteractionUpdateOptions> {
  const testAreas = (await TestArea.find())
    .filter(testArea => {
      switch (filter) {
        case Filter.active1d: return testArea.lastActivityAt.getTime() > Date.now() - 86400000;
        case Filter.active1w: return testArea.lastActivityAt.getTime() > Date.now() - 604800000;
        case Filter.active1m: return testArea.lastActivityAt.getTime() > Date.now() - 2592000000;
        case Filter.active6m: return testArea.lastActivityAt.getTime() > Date.now() - 15552000000;
        case Filter.stale1d: return testArea.lastActivityAt.getTime() < Date.now() - 86400000;
        case Filter.stale1w: return testArea.lastActivityAt.getTime() < Date.now() - 604800000;
        case Filter.stale1m: return testArea.lastActivityAt.getTime() < Date.now() - 2592000000;
        case Filter.stale6m: return testArea.lastActivityAt.getTime() < Date.now() - 15552000000;
        case Filter.ownerIsMe: return testArea.ownerId === interaction.user.id;
        case Filter.ownerIsNotMe: return testArea.ownerId !== interaction.user.id;
        case Filter.none:
        default: return true;
      }
    })
    // eslint-disable-next-line complexity -- lol
    .sort((a, b) => {
      const [aGuild, bGuild] = [workers.get(a.botId)?.guilds.cache.get(a.serverId) ?? null, workers.get(b.botId)?.guilds.cache.get(b.serverId) ?? null];
      const [aOwner, bOwner] = [interaction.client.users.cache.get(a.ownerId) ?? null, interaction.client.users.cache.get(b.ownerId) ?? null];
      switch (sort) {
        case Sort.creationDateAscending: return (aGuild?.createdTimestamp ?? 0) - (bGuild?.createdTimestamp ?? 0);
        case Sort.creationDateDescending: return (bGuild?.createdTimestamp ?? 0) - (aGuild?.createdTimestamp ?? 0);
        case Sort.nameAZ: return aGuild?.name.localeCompare(bGuild?.name ?? "") ?? 0;
        case Sort.nameZA: return bGuild?.name.localeCompare(aGuild?.name ?? "") ?? 0;
        case Sort.ownerAZ: return aOwner?.username.localeCompare(bOwner?.username ?? "") ?? 0;
        case Sort.ownerZA: return bOwner?.username.localeCompare(aOwner?.username ?? "") ?? 0;
        case Sort.none:
        default: return 0;
      }
    });
  const testAreasPage = testAreas.slice(page * entriesPerPage, (page + 1) * entriesPerPage);

  selectMenuComponents.set(`${interaction.id}:filter`, {
    selectType: "string",
    allowedUsers: [interaction.user.id],
    async callback(select) {
      return void select.update(await generateMessage(interaction, Number(select.values[0] ?? Filter.none) as unknown as Filter, sort, page));
    },
  });

  selectMenuComponents.set(`${interaction.id}:sort`, {
    selectType: "string",
    allowedUsers: [interaction.user.id],
    async callback(select) {
      return void select.update(await generateMessage(interaction, filter, Number(select.values[0] ?? Sort.none) as unknown as Sort, page));
    },
  });

  buttonComponents.set(`${interaction.id}:go-to-start`, {
    allowedUsers: [interaction.user.id],
    async callback(button) {
      return void button.update(await generateMessage(interaction, filter, sort, 0));
    },
  });

  buttonComponents.set(`${interaction.id}:go-back`, {
    allowedUsers: [interaction.user.id],
    async callback(button) {
      return void button.update(await generateMessage(interaction, filter, sort, Math.max(0, page - 1)));
    },
  });

  buttonComponents.set(`${interaction.id}:go-forward`, {
    allowedUsers: [interaction.user.id],
    async callback(button) {
      return void button.update(await generateMessage(interaction, filter, sort, page + 1));
    },
  });

  buttonComponents.set(`${interaction.id}:go-to-end`, {
    allowedUsers: [interaction.user.id],
    async callback(button) {
      return void button.update(await generateMessage(interaction, filter, sort, Math.floor(testAreas.length / entriesPerPage)));
    },
  });

  return {
    content: testAreas.length ? `📋 Showing test areas **${entriesPerPage * page + 1}-${Math.min(testAreas.length, entriesPerPage * (page + 1) + 1)}** out of a total **${testAreas.length}** test areas matching your filter.` : "❌ No test areas matched your filter. Try to filter something else, or create a new test area.",
    embeds: await Promise.all(testAreasPage.map<Promise<APIEmbed>>(async testArea => {
      const worker = workers.get(testArea.botId);
      const guild = await worker?.guilds.fetch({ guild: testArea.serverId, cache: true, force: false }).catch(() => null) ?? null;
      const owner = await interaction.client.users.fetch(testArea.ownerId, { cache: true, force: false });
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- typescript bug idk why
      const members = Array.from(await guild?.members.fetch().then(list => list.values()) ?? []) as GuildMember[];
      const bots = members.filter(member => member.user.bot && member.user.id !== testArea.botId);
      const humans = members.filter(member => !member.user.bot);
      return {
        color: guild ? Number(testArea.serverId) % 0xFFFFFF : Colors.Red,
        author: {
          name: owner.tag,
          iconUrl: owner.displayAvatarURL({ size: 32 }),
        },
        title: guild?.name ?? `Unknown guild ${testArea.serverId}`,
        url: testArea.invite,
        ...guild && {
          description: `created ${time(guild.createdAt, TimestampStyles.RelativeTime)} - last activity was ${time(testArea.lastActivityAt, TimestampStyles.RelativeTime)}`,
          fields: [
            {
              name: humans.length === 1 ? "1 human" : `${humans.length} humans`,
              value: humans
                .map(human => human.user.toString())
                .sort((a, b) => a.localeCompare(b))
                .join("\n") || "*No humans.*",
              inline: true,
            },
            {
              name: bots.length === 1 ? "1 bot" : `${bots.length} bots`,
              value: bots

                .map(bot => bot.user.toString())
                .sort((a, b) => a.localeCompare(b))
                .join("\n") || "*No bots.*",
              inline: true,
            },
          ],
          footer: {
            text: `worker: ${worker?.user.username ?? "n/a"} (${testArea.botId})`,
          },
        },
      };
    })),
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.StringSelect,
            placeholder: {
              [Filter.none]: "Filter: None",
              [Filter.active1d]: "Filter: Active (1 day)",
              [Filter.active1w]: "Filter: Active (1 week)",
              [Filter.active1m]: "Filter: Active (1 month)",
              [Filter.active6m]: "Filter: Active (6 months)",
              [Filter.stale1d]: "Filter: Stale (1 day)",
              [Filter.stale1w]: "Filter: Stale (1 week)",
              [Filter.stale1m]: "Filter: Stale (1 month)",
              [Filter.stale6m]: "Filter: Stale (6 months)",
              [Filter.ownerIsMe]: "Filter: Owned by me",
              [Filter.ownerIsNotMe]: "Filter: Not owned by me",
            }[filter],
            customId: `${interaction.id}:filter`,
            minValues: 0,
            maxValues: 1,
            options: [
              { label: "None", value: String(Filter.none) },
              { label: "Active (1 day)", value: String(Filter.active1d) },
              { label: "Active (1 week)", value: String(Filter.active1w) },
              { label: "Active (1 month)", value: String(Filter.active1m) },
              { label: "Active (6 months)", value: String(Filter.active6m) },
              { label: "Stale (1 day)", value: String(Filter.stale1d) },
              { label: "Stale (1 week)", value: String(Filter.stale1w) },
              { label: "Stale (1 month)", value: String(Filter.stale1m) },
              { label: "Stale (6 months)", value: String(Filter.stale6m) },
              { label: "Owned by me", value: String(Filter.ownerIsMe) },
              { label: "Not owned by me", value: String(Filter.ownerIsNotMe) },
            ],
          },
        ],
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.StringSelect,
            placeholder: {
              [Sort.none]: "Sorting by: None",
              [Sort.creationDateAscending]: "Sorting by: Creation date (ascending)",
              [Sort.creationDateDescending]: "Sorting by: Creation date (descending)",
              [Sort.nameAZ]: "Sorting by: Name (A-Z)",
              [Sort.nameZA]: "Sorting by: Name (Z-A)",
              [Sort.ownerAZ]: "Sorting by: Owner (A-Z)",
              [Sort.ownerZA]: "Sorting by: Owner (Z-A)",
            }[sort],
            customId: `${interaction.id}:sort`,
            minValues: 1,
            maxValues: 1,
            options: [
              { label: "None", value: String(Sort.none) },
              { label: "Creation date (ascending)", value: String(Sort.creationDateAscending) },
              { label: "Creation date (descending)", value: String(Sort.creationDateDescending) },
              { label: "Name (A-Z)", value: String(Sort.nameAZ) },
              { label: "Name (Z-A)", value: String(Sort.nameZA) },
              { label: "Owner (A-Z)", value: String(Sort.ownerAZ) },
              { label: "Owner (Z-A)", value: String(Sort.ownerZA) },
            ],
          },
        ],
      },
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: "\u00ab",
            customId: `${interaction.id}:go-to-start`,
            style: ButtonStyle.Primary,
            disabled: page === 0,
          },
          {
            type: ComponentType.Button,
            label: "\u2039",
            customId: `${interaction.id}:go-back`,
            style: ButtonStyle.Primary,
            disabled: page === 0,
          },
          {
            type: ComponentType.Button,
            label: `${page + 1} / ${Math.ceil(testAreas.length / entriesPerPage)}`,
            customId: "disabled",
            style: ButtonStyle.Secondary,
            disabled: true,
          },
          {
            type: ComponentType.Button,
            label: "\u203A",
            customId: `${interaction.id}:go-forward`,
            style: ButtonStyle.Primary,
            disabled: page === Math.ceil(testAreas.length / entriesPerPage) - 1,
          },
          {
            type: ComponentType.Button,
            label: "\u00bb",
            customId: `${interaction.id}:go-to-end`,
            style: ButtonStyle.Primary,
            disabled: page === Math.ceil(testAreas.length / entriesPerPage) - 1,
          },
        ],
      },
    ],
  };
}
