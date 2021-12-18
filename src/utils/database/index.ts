import { Area } from "../../@types/area";
import { createDatabase } from "./quick";

export const areas = createDatabase<Area>("areas");

export const access = createDatabase<true>("access");

export const emojis = createDatabase<string>("emojis");
