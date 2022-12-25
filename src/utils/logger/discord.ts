import { createFileTransports, globalFormat } from "./";
import { createLogger, transports } from "winston";
import type{ Logger } from "winston";

export const discordLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports("discord", ["info", "debug"]),
    new transports.Console({ level: "info" }),
  ],
});

export const workerLogger = (workerName: string): Logger => createLogger({
  format: globalFormat,
  transports: createFileTransports(`worker-${workerName}`, ["debug"]),
});
