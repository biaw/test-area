/* eslint-disable max-classes-per-file */
import type{ DocumentType } from "@typegoose/typegoose";
import { getModelForClass, prop } from "@typegoose/typegoose";
import type{ Snowflake } from "discord.js";

export class TestAreaRoles {
  @prop({ type: String, required: true }) ownerId!: Snowflake;
  @prop({ type: String, required: true }) botId!: Snowflake;
  @prop({ type: String, required: true }) adminId!: Snowflake;
}

export class TestAreaSchema {
  @prop({ type: String, required: true }) serverId!: Snowflake;
  @prop({ type: String, required: true }) botId!: Snowflake;
  @prop({ type: String, required: true }) ownerId!: Snowflake;
  @prop({ type: Date, default: Date.now }) lastActivityAt!: Date;
  @prop({ type: TestAreaRoles, required: true }) roles!: TestAreaRoles;
  @prop({ type: String, required: true }) invite!: string;
}

export type TestAreaDocument = DocumentType<TestAreaSchema>;

export const TestArea = getModelForClass(TestAreaSchema);
