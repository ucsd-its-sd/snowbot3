import { Message } from "discord.js";
import { StateContainer } from "./stateContainer";
import { State } from "./state";

/**
 * Describes a command, including its match regex and execution function.
 * Implement this interface to create a command.
 */
export interface Command {
    /**
     * The regular expression that needs to match to run this command.
     * The regex should have a named capture group for each argument.
     * The regex will be run with the flags `igm`.
     * @example /!sal (?<pid>\w+)/
     */
    regex: RegExp;

    /**
     * The name of the command, used in the help command.
     */
    name: string;

    /**
     * A short description of the command, used in the help command.
     */
    description?: string;

    /**
     * Run when the command is detected.
     * @param msg The message that triggered the command.
     * @param match Information about the matched command.
     */
    execute(msg: Message, match: CommandMatch, state: StateContainer<State>): void;
}


/**
 * Contains information about a matched command.
 */
export interface CommandMatch {
    /**
     * The matched text.
     */
    content: string;

    /**
     * The start (inclusive) and end (exclusive) indices of the matched command.
     */
    range: [number, number];

    /**
     * The named capture groups of the matched command.
     */
    groups: Record<string, string>;
}