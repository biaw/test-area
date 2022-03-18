import type { ButtonInteraction, SelectMenuInteraction } from "discord.js";

type ComponentInteractionCallback = (interaction: SelectMenuInteraction | ButtonInteraction) => void;
interface ComponentInteractionDetails {
  allowedUsers: Array<string> | null,
  callback: ComponentInteractionCallback
}

export const components: Map<string, ComponentInteractionCallback | ComponentInteractionDetails> = new Map();

export default (interaction: SelectMenuInteraction | ButtonInteraction): void => {
  const detailsOrCallback = components.get(interaction.customId);
  if (detailsOrCallback) {
    const component: ComponentInteractionDetails = "callback" in detailsOrCallback ?
      detailsOrCallback :
      {
        allowedUsers: [interaction.message.interaction?.user.id || ""],
        callback: detailsOrCallback,
      };
    if (component.allowedUsers && !component.allowedUsers.includes(interaction.user.id)) return; // user is not allowed to interact, so just ignore
    component.callback(interaction);
  }
};
