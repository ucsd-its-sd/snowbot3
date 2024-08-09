import { PathLike, readFileSync } from "fs";
import * as fs from "fs/promises";

export interface IStateContainer<T> {
  /** Gets the current state. */
  read(): Promise<T>;

  /** Updates the state. */
  write(state: T): Promise<void>;
}

export class JSONStateContainer<T> implements IStateContainer<T> {
  private readonly file: PathLike;

  private state: T;

  constructor(file: PathLike) {
    this.file = file;

    // Initialize state; this is the only time we do it synchronously
    this.state = JSON.parse(readFileSync(file, "utf-8")) as T;

    // Watch the file, so we update whenever it changes.
    // Runs forever, but gives up control when there is no update,
    // so we should not await it.
    this.init();
  }

  async read(): Promise<T> {
    return this.state;
  }

  async write(state: T): Promise<void> {
    const backup = `${this.file}.bak`;
    const jsonStr = JSON.stringify(state, undefined, 4);
    try {
      // Write to a backup to make sure we don't accidentally corrupt the file.
      await fs.writeFile(backup, jsonStr);

      // Rename the backup to the actual file, overwriting it.
      await fs.rename(backup, this.file);
    } catch (e) {
      console.error(
        "[ERROR] [State] " +
          e +
          "\nWrite failed. Attempted content was:\n" +
          jsonStr,
      );
    }
  }

  private async init(): Promise<void> {
    const ac = new AbortController();
    const { signal } = ac;

    try {
      const watcher = fs.watch(this.file, { persistent: false, signal });

      // Every time we get a new event, re-read the file.
      for await (const e of watcher) {
        this.state = await fs
          .readFile(this.file, "utf-8")
          .then(JSON.parse)
          .then((x) => x as T);
      }
    } catch (err) {
      // This isn't used at the moment but I've left it in
      // in case someone uses the aborter later.
      if (err instanceof Error && err.name == "AbortError") {
        return;
      }

      throw err;
    } finally {
      // Clean up after ourselves by ending the watch.
      ac.abort();
    }
  }
}
