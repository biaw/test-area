export type Area = {
  ownerId: string;
  elevated: Array<string>;
  roles: {
    elevated: string;
    owner: string;
    bot: string;
    admin: string;
  };
  inviteCode: string;
}
