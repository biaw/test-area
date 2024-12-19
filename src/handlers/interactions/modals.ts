import type{ Awaitable, ModalSubmitInteraction } from "discord.js";

export type Modal = (interaction: ModalSubmitInteraction) => Awaitable<void>;

export const modals = new Map<string, Modal>();

export default function modalHandler(interaction: ModalSubmitInteraction): void {
  const modal = modals.get(interaction.customId);
  if (modal) void modal(interaction);
  modals.delete(interaction.customId);
}
