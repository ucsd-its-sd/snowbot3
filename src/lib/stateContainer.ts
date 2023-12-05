import { PathLike, readFileSync } from "fs";
import * as fs from "fs/promises";

export interface IStateContainer<T> {
    /** Gets the current state. */
    read(): T;

    /** Updates the state. */
    write(state: T): void;
}

export class JSONStateContainer<T> implements IStateContainer<T> {
    private file: PathLike;

    private state: T;

    constructor(file: PathLike) {
        this.file = file;

        // Initialize state; this is the only time we do it synchronously
        this.state = JSON.parse(readFileSync(file, 'utf-8')) as T;

        // Watch the file, so we update whenever it changes.
        // Runs forever, but gives up control when there is no update,
        // so we should not await it.
        this.init();
    }

    read(): T {
        return this.state;
    }

    write(state: T): void {
        fs.copyFile(this.file, `${this.file}.bak`).then(
            () => fs.writeFile(this.file, JSON.stringify(state, undefined, 4)),
            () => console.log("Failed to backup file, not proceeding with write."))
    }

    private async init() {
        const ac = new AbortController();
        const { signal } = ac;

        try {
            const watcher = fs.watch(this.file, { persistent: false, signal });

            // Every time we get a new event, re-read the file.
            for await (const _ of watcher) {
                await this.update();
            }
        } catch (err) {
            // This isn't used at the moment but I've left it in
            // in case someone uses the aborter later.
            if (err instanceof Error && err.name == 'AbortError')
                return;

            throw err;
        } finally {
            // Clean up after ourselves by ending the watch.
            ac.abort();
        }
    }

    private async update(): Promise<void> {
        // Read the file, parse it, and convert it.
        this.state = await fs.readFile(this.file, 'utf-8').then(JSON.parse).then(x => x as T);
    }
}