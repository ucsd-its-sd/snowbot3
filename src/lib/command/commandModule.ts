import { Command } from "./command";

/** Command modules can dispatch this to trigger a regex rebuild. */
export const rebuildEvent = new Event("rebuild");

/**
 * Implement this interface to create a command module.
 */
export abstract class CommandModule extends EventTarget {
  /** The commands in this module. */
  abstract get commands(): Command[];

  /**
   * If undefined, no help command will be generated.
   * Otherwise, generates a help command with the given name.
   */
  helpCommand?: string;

  /**
   * Should only be undefined if `helpCommand` is undefined.
   */
  helpTitle?: string;
}
