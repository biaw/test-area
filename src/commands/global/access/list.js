module.exports = {
  description: "List everyone who has been given access",
  group: "ACCESS"
};

const { access } = require("../../../database"), config = require("../../../../config.json");

module.exports.execute = async (client, interaction, {}, { staff, owner }) => {
  const users = Object.keys(await access.get());

  client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: { embeds: [{
    fields: [
      {
        name: "Users with access",
        value: users.map(u => `${staff} <@${u}>`).join("\n"),
        inline: true
      },
      {
        name: "Owner",
        value: `${owner} <@${config.owner}>`,
        inline: true
      }
    ],
    color: config.embedColors.success
  }]}}});
};