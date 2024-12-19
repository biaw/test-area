/* eslint-disable max-classes-per-file */
import type { DocumentType } from "@typegoose/typegoose";
import type { Guild, GuildMember, Snowflake, User } from "discord.js";
import { getModelForClass, post, prop, PropType } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import Worker from "../../handlers/workers/Worker";
import client from "../../utils/client";

export class TestAreaRoles {
  @prop({ type: String, required: true }) readonly adminId!: Snowflake;
  @prop({ type: String, required: true }) readonly botId!: Snowflake;
  @prop({ type: String, required: true }) readonly managerId!: Snowflake;
  @prop({ type: String, required: true }) readonly operatorId!: Snowflake;
  @prop({ type: String, required: true }) readonly ownerId!: Snowflake;
}

export class TestAreaGuild {
  @prop({ type: String, required: true }) inviteCode!: string;
  @prop({ type: String, required: true }) name!: string;
  @prop({ type: [String], default: [] }, PropType.ARRAY) operatorIds!: Snowflake[];
  @prop({ type: TestAreaRoles, required: true }) readonly roles!: TestAreaRoles;
}

/* eslint-disable @typescript-eslint/no-invalid-this */
@post<TestAreaSchema>("save", function () {
  void this.updateRoles();
})
/* eslint-enable @typescript-eslint/no-invalid-this */

export class TestAreaSchema extends TimeStamps {
  @prop({ type: TestAreaGuild, required: true }) guild!: TestAreaGuild;
  @prop({ type: String, required: true, unique: true }) readonly guildId!: Snowflake;
  @prop({ type: Date, default: Date.now }) lastActivityAt!: Date;
  @prop({ type: String, required: true }) ownerId!: Snowflake;
  @prop({ type: String, required: true }) readonly workerId!: Snowflake;

  get discordGuild(): Guild | null {
    return this.worker.client.guilds.cache.get(this.guildId) ?? null;
  }

  get ownerMember(): GuildMember | null {
    return this.discordGuild?.members.cache.get(this.ownerId) ?? null;
  }

  get ownerUser(): null | User {
    return (
      this.ownerMember?.user ??
      client.users.cache.get(this.ownerId) ??
      Array.from(Worker.workers.values()).find(worker => worker.client.users.cache.has(this.ownerId))?.client.users.cache.get(this.ownerId) ??
      null
    );
  }

  get worker(): Worker {
    return Worker.workers.get(this.workerId)!;
  }

  async updateRoles(): Promise<void> {
    if (!this.discordGuild) return;

    const members = await this.discordGuild.members.fetch();
    for (const [, member] of members) {
      let roleToHave: null | Snowflake = null;
      if (member.user.bot && member.user.id !== this.workerId) roleToHave = this.guild.roles.botId;
      if (this.guild.operatorIds.includes(member.id)) roleToHave = this.guild.roles.operatorId;
      if (member.id === this.ownerId) roleToHave = this.guild.roles.ownerId;
      if (member.user.id === this.workerId) roleToHave = this.guild.roles.managerId;

      const rolesToRemove = [
        this.guild.roles.botId,
        this.guild.roles.operatorId,
        this.guild.roles.ownerId,
        this.guild.roles.managerId,
      ].filter(roleToRemove => member.roles.cache.has(roleToRemove) && roleToRemove !== roleToHave);
      if (rolesToRemove.length) await member.roles.remove(rolesToRemove);

      if (roleToHave && !member.roles.cache.has(roleToHave)) await member.roles.add(roleToHave);
    }
  }
}

export type TestAreaDocument = DocumentType<TestAreaSchema>;
export const TestArea = getModelForClass(TestAreaSchema);
