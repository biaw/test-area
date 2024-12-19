import type{ APIEmbed, Interaction, InteractionReplyOptions, InteractionUpdateOptions } from "discord.js";
import { ButtonStyle, Colors, ComponentType, RouteBases, time, TimestampStyles } from "discord.js";
import type{ SecondLevelChatInputCommand } from "..";
import config from "../../../config";
import { TestArea } from "../../../database/models/TestArea";
import { buttonComponents, selectMenuComponents } from "../../../handlers/interactions/components";

export default {
  name: "list",
  description: "List all the test areas",
  async execute(interaction) {
    return void interaction.reply(await generateMessage(interaction));
  },
} satisfies SecondLevelChatInputCommand;

enum Filter { None, Active1d, Active1w, Active1m, Active6m, Stale1d, Stale1w, Stale1m, Stale6m, OwnerIsMe, OwnerIsNotMe }
enum Sort { None, CreationDateAscending, CreationDateDescending, NameAZ, NameZA, OwnerAZ, OwnerZA }

const entriesPerPage = 5;

async function generateMessage(interaction: Interaction, filter: Filter = Filter.None, sort: Sort = Sort.None, page = 0): Promise<InteractionReplyOptions & InteractionUpdateOptions> {
  const testAreas = (await TestArea.find())
    .filter(testArea => {
      switch (filter) {
        case Filter.Active1d: return testArea.lastActivityAt.getTime() > Date.now() - 86400000;
        case Filter.Active1w: return testArea.lastActivityAt.getTime() > Date.now() - 604800000;
        case Filter.Active1m: return testArea.lastActivityAt.getTime() > Date.now() - 2592000000;
        case Filter.Active6m: return testArea.lastActivityAt.getTime() > Date.now() - 15552000000;
        case Filter.Stale1d: return testArea.lastActivityAt.getTime() < Date.now() - 86400000;
        case Filter.Stale1w: return testArea.lastActivityAt.getTime() < Date.now() - 604800000;
        case Filter.Stale1m: return testArea.lastActivityAt.getTime() < Date.now() - 2592000000;
        case Filter.Stale6m: return testArea.lastActivityAt.getTime() < Date.now() - 15552000000;
        case Filter.OwnerIsMe: return testArea.ownerId === interaction.user.id;
        case Filter.OwnerIsNotMe: return testArea.ownerId !== interaction.user.id;
        case Filter.None:
        default: return true;
      }
    })
    // eslint-disable-next-line complexity -- lol
    .sort((a, b) => {
      switch (sort) {
        case Sort.CreationDateAscending: return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
        case Sort.CreationDateDescending: return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
        case Sort.NameAZ: return a.guild.name.localeCompare(b.guild.name);
        case Sort.NameZA: return b.guild.name.localeCompare(a.guild.name);
        case Sort.OwnerAZ: return a.ownerUser?.username.localeCompare(b.ownerUser?.username ?? "") ?? 0;
        case Sort.OwnerZA: return b.ownerUser?.username.localeCompare(a.ownerUser?.username ?? "") ?? 0;
        case Sort.None:
        default: return 0;
      }
    });
  const testAreasPage = testAreas.slice(page * entriesPerPage, (page + 1) * entriesPerPage);

  selectMenuComponents.set(`${interaction.id}:filter`, {
    selectType: "string",
    allowedUsers: [interaction.user.id],
    async callback(select) {
      return void select.update(await generateMessage(interaction, Number(select.values[0] ?? Filter.None) as unknown as Filter, sort, page));
    },
  });

  selectMenuComponents.set(`${interaction.id}:sort`, {
    selectType: "string",
    allowedUsers: [interaction.user.id],
    async callback(select) {
      return void select.update(await generateMessage(interaction, filter, Number(select.values[0] ?? Sort.None) as unknown as Sort, page));
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

  let content = testAreas.length ?
    `📋 Showing test areas **${entriesPerPage * page + 1}-${Math.min(testAreas.length, entriesPerPage * (page + 1) + 1)}** out of a total **${testAreas.length}** test areas matching your filter.` :
    "❌ No test areas matched your filter. Try to filter something else, or create a new test area.";
  if (filter === Filter.None) content = interaction.user.id === config.ownerId ? "❌ There are no test areas created yet." : "❌ You haven't created any test areas yet.";

  return {
    content,
    embeds: await Promise.all(testAreasPage.map<Promise<APIEmbed>>(async testArea => {
      const members = await testArea.discordGuild?.members.fetch({ withPresences: false });
      const bots = members?.filter(member => member.user.bot && member.user.id !== testArea.workerId);
      const humans = members?.filter(member => !member.user.bot);
      return {
        title: testArea.discordGuild?.name ?? `Unknown guild ${testArea.guildId}`,
        color: testArea.discordGuild ? Number(testArea.guildId) % 0xFFFFFF : Colors.Red,
        description: `created ${time(testArea.discordGuild?.createdAt ?? testArea.createdAt ?? new Date(0), TimestampStyles.RelativeTime)}, last activity was ${time(testArea.lastActivityAt, TimestampStyles.RelativeTime)}`,
        ...testArea.discordGuild && {
          ...humans && bots && {
            fields: [
              {
                name: humans.size === 1 ? "1 human" : `${humans.size} humans`,
                value: humans
                  .map(human => human.user.toString())
                  .sort((a, b) => a.localeCompare(b))
                  .join("\n") || "*No humans.*",
                inline: true,
              }, {
                name: bots.size === 1 ? "1 bot" : `${bots.size} bots`,
                value: bots
                  .map(bot => bot.user.toString())
                  .sort((a, b) => a.localeCompare(b))
                  .join("\n") || "*No bots.*",
                inline: true,
              },
            ],
          },
        },
        ...testArea.ownerUser && {
          author: {
            name: `@${testArea.ownerUser.username}`,
            iconUrl: testArea.ownerUser.displayAvatarURL({ size: 32 }),
          },
        },
        url: `${RouteBases.invite}/${testArea.guild.inviteCode}`,
        footer: { text: `worker: ${testArea.worker.client.user?.username ?? "n/a"} (${testArea.workerId})` },
      };
    })),
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.StringSelect,
            placeholder: {
              [Filter.None]: "Filter: None",
              [Filter.Active1d]: "Filter: Active (1 day)",
              [Filter.Active1w]: "Filter: Active (1 week)",
              [Filter.Active1m]: "Filter: Active (1 month)",
              [Filter.Active6m]: "Filter: Active (6 months)",
              [Filter.Stale1d]: "Filter: Stale (1 day)",
              [Filter.Stale1w]: "Filter: Stale (1 week)",
              [Filter.Stale1m]: "Filter: Stale (1 month)",
              [Filter.Stale6m]: "Filter: Stale (6 months)",
              [Filter.OwnerIsMe]: "Filter: Owned by me",
              [Filter.OwnerIsNotMe]: "Filter: Not owned by me",
            }[filter],
            customId: `${interaction.id}:filter`,
            minValues: 0,
            maxValues: 1,
            options: [
              { label: "None", value: String(Filter.None) },
              { label: "Active (1 day)", value: String(Filter.Active1d) },
              { label: "Active (1 week)", value: String(Filter.Active1w) },
              { label: "Active (1 month)", value: String(Filter.Active1m) },
              { label: "Active (6 months)", value: String(Filter.Active6m) },
              { label: "Stale (1 day)", value: String(Filter.Stale1d) },
              { label: "Stale (1 week)", value: String(Filter.Stale1w) },
              { label: "Stale (1 month)", value: String(Filter.Stale1m) },
              { label: "Stale (6 months)", value: String(Filter.Stale6m) },
              ...interaction.user.id === config.ownerId ?
                [
                  { label: "Owned by me", value: String(Filter.OwnerIsMe) },
                  { label: "Not owned by me", value: String(Filter.OwnerIsNotMe) },
                ] :
                [],
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
              [Sort.None]: "Sorting by: None",
              [Sort.CreationDateAscending]: "Sorting by: Creation date (ascending)",
              [Sort.CreationDateDescending]: "Sorting by: Creation date (descending)",
              [Sort.NameAZ]: "Sorting by: Name (A-Z)",
              [Sort.NameZA]: "Sorting by: Name (Z-A)",
              [Sort.OwnerAZ]: "Sorting by: Owner (A-Z)",
              [Sort.OwnerZA]: "Sorting by: Owner (Z-A)",
            }[sort],
            customId: `${interaction.id}:sort`,
            minValues: 1,
            maxValues: 1,
            options: [
              { label: "None", value: String(Sort.None) },
              { label: "Creation date (ascending)", value: String(Sort.CreationDateAscending) },
              { label: "Creation date (descending)", value: String(Sort.CreationDateDescending) },
              { label: "Name (A-Z)", value: String(Sort.NameAZ) },
              { label: "Name (Z-A)", value: String(Sort.NameZA) },
              ...interaction.user.id === config.ownerId ?
                [
                  { label: "Owner (A-Z)", value: String(Sort.OwnerAZ) },
                  { label: "Owner (Z-A)", value: String(Sort.OwnerZA) },
                ] :
                [],
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
            label: `${testAreas.length ? page + 1 : 0} / ${Math.ceil(testAreas.length / entriesPerPage)}`,
            customId: "disabled",
            style: ButtonStyle.Secondary,
            disabled: true,
          },
          {
            type: ComponentType.Button,
            label: "\u203A",
            customId: `${interaction.id}:go-forward`,
            style: ButtonStyle.Primary,
            disabled: testAreas.length === 0 || page === Math.ceil(testAreas.length / entriesPerPage) - 1,
          },
          {
            type: ComponentType.Button,
            label: "\u00bb",
            customId: `${interaction.id}:go-to-end`,
            style: ButtonStyle.Primary,
            disabled: testAreas.length === 0 || page === Math.ceil(testAreas.length / entriesPerPage) - 1,
          },
        ],
      },
    ],
  };
}
