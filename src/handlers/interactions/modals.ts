import type{ Awaitable, ModalSubmitInteraction } from "discord.js";

export type Modal = (interaction: ModalSubmitInteraction<"cached">) => Awaitable<void>;

export const modals = new Map<string, Modal>();

export default function modalHandler(interaction: ModalSubmitInteraction<"cached">): void {
  const modal = modals.get(interaction.customId);
  if (modal) void modal(interaction);
  modals.delete(interaction.customId);
}
