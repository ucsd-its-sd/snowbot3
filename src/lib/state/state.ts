import { UserMention } from "discord.js";

/**
 * Represents the global state of the bot.
 */
export interface State {
  /** The bot's token. */
  token: string;

  /** The list of leads to keep track of emoji for */
  leads: Lead[];

  /** The state of the WhenIWork component */
  whenIWork: WhenIWorkState;
}

/**
 * Represents a lead's account and emoji, for phonebook and firing commands.
 */
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

/**
 * Represents the state of the WhenIWork component.
 */
export interface WhenIWorkState {
  /** The user's token; needs to be refreshed once every 7 days. */
  token: string;

  /** Time token issued at. */
  iat: number;

  /** Dictionary of user IDs to users. */
  userDict: Record<string, WhenIWorkUser>;
}

/**
 * Represents a user in WhenIWork.
 */
export interface WhenIWorkUser {
  /** The user's email. */
  email: string;

  /** The user's ping (aka Discord mention). */
  ping: UserMention;

  /** Whether the user is currently scheduled. */
  scheduled: boolean;

  /** Whether the user is currently punched in. TODO: CURRENTLY UNUSED, requires WhenIWork webhooks API */
  punched: boolean;
}
