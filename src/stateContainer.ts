import { PathLike } from "fs";
import * as fs from "fs/promises";

export interface StateContainer<T> {
    /** Gets the state; this should always be cached,
     *  as accessing it may incur reading costs. */
    read(): Promise<T>;

    /** Updates the state. */
    update(state: T): Promise<void>;
}

export class JSONStateContainer<T> implements StateContainer<T> {
    private file: PathLike;

    private state: T | null = null;

    constructor(file: PathLike) {
        this.file = file;
    }

    async read(): Promise<T> {
        let res = await fs.readFile(this.file, 'utf-8').then(JSON.parse).then(x => x as T);
        this.state = res;
        return res;
    }

    async update(state: T): Promise<void> {

    }
}