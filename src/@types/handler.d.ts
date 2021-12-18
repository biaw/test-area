import { Client } from "discord.js";

export type Handler = (client: Client<true>) => Promise<void>;
