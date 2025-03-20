import { PathLike, readFileSync } from "fs";
import * as fs from "fs/promises";

/**
 * Represents a state container, an implementation agnostic abstraction over state.
 */
export interface IStateContainer<T> {
  /**
   * Reads the current state.
   *
   * @returns The current state.
   */
  read(): Promise<T>;

  /**
   * Writes an updated state.
   *
   * @param state The new state.
   * @returns A promise that resolves when the state has been written.
   */
  write(state: T): Promise<void>;
}

/**
 * A state container that uses a JSON file to store state.
 */
export class JSONStateContainer<T> implements IStateContainer<T> {
  private readonly file: PathLike;

  private state: T;

  /**
   * Creates a new JSON state container.
   *
   * @param file The file to store/read the state in
   * @returns A new JSON state container
   */
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
    // We keep the state in memory, so we don't need to look at the file
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

  /**
   * Initializes the state container, and creates a watcher on the file to keep the state up to date.
   * @returns Never resolves; watches the file for changes and updates the state.
   */
  private async init(): Promise<void> {
    // Create an abort controller to cancel the watcher;
    // could be used to stop the watcher externally in the future, if needed.
    const ac = new AbortController();
    // Extract the signal from the controller.
    const { signal } = ac;

    try {
      // Create a watcher (stream of edit events) on the file.
      // Not persistent since we don't need to watch if the bot is fully stopped.
      const watcher = fs.watch(this.file, { persistent: false, signal });

      // Every time we get a new event, re-parse the file.
      for await (const e of watcher) {
        this.state = await fs
          .readFile(this.file, "utf-8")
          .then(JSON.parse)
          .then((x) => x as T);
      }
    } catch (err) {
      // This isn't used at the moment but I've left it in, in case someone uses the aborter later.
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
