import { UserMention } from "discord.js";

export interface State {
  token: string;

  leads: Lead[];

  whenIWork: WhenIWorkState;
}

export interface Lead {
  name: string;

  /** Of the format <@number>. */
  ping: UserMention;

  /** Of the format <:name:number>, unless it is a default emoji. */
  emote?: string;

  /** Of the format :name: */
  emoteName?: string;

  /** Whether the lead is opted-out from firing */
  dontFire?: boolean;
}

export interface WhenIWorkState {
  /** The user's token; needs to be refreshed once every 7 days. */
  token: string;

  /** Time token issued at. */
  iat: number;

  /** Dictionary of user IDs to users. */
  userDict: Record<string, WhenIWorkUser>;
}

export interface WhenIWorkUser {
  email: string;

  ping: UserMention;

  scheduled: boolean;

  punched: boolean;
}
