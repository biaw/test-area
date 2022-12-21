import config from "../config";
import { databaseLogger } from "../utils/logger/database";
import { inspect } from "util";
import mongoose from "mongoose";

mongoose.set("debug", (collectionName, method, query: string, doc: string) => databaseLogger.debug(JSON.stringify({ collectionName, method, query, doc })));

export const connection = mongoose.connect(config.databaseUri);

connection
  .then(() => databaseLogger.info("Connected to database"))
  .catch(err => databaseLogger.error(`Error when connecting to database: ${inspect(err)}`));
