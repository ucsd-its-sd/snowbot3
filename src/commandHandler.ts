import { CommandModule } from "./commandModule";

export class CommandHandler {
    modules: CommandModule[];

    private combinedRegex: RegExp;

    constructor(modules: CommandModule[]) {
        this.modules = modules;

        const namedGroupRegex = /\(\?<(\w+)>/g;

        // Combine all the regexes with alternation.
        this.combinedRegex = new RegExp(
            `(${this.modules
                .flatMap((m, i) => m.commands.map((c, j) => {
                    let regText = c.regex.source;
                    // Adds a prefix to each named group to avoid collisions
                    let result = regText.replace(namedGroupRegex, `(?<_${i}_${j}_$1>`);
                    // Wraps the regex in a named group
                    return `(?<_${i}_${j}>${result})`;
                }))
                .join('|')})`,
            'digm');
    }

    exec(): RegExp {
        return this.combinedRegex;
    }
}