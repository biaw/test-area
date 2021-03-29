module.exports = {
  description: "Ping the bot"
};

module.exports.execute = async (client, interaction) => {
  const start = Date.now();
  await client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 5 } })
  client.api.webhooks(client.user.id, interaction.token).messages["@original"].patch({ data: { content: `🏓 Server latency is \`${Date.now() - start}ms\`, API latency is \`${client.ws.ping}ms\`.` } })
};