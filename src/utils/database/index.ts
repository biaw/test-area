import type { Area } from "../../@types/area";
import { createDatabase } from "./quick";

export const areas = createDatabase<Area>("areas");

export const access = createDatabase<true>("access");
