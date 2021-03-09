import React, { createContext, useState } from "react";
import { CHANGE, ERROR } from "../../jacdac-ts/src/jdom/constants";
import { JDEventSource } from "../../jacdac-ts/src/jdom/eventsource";
import { delay } from "../../jacdac-ts/src/jdom/utils";
import useEffectAsync from "./useEffectAsync";

export const DB_VALUE_CHANGE = "dbValueChange"

export class DbStore<T> extends JDEventSource {
    constructor(public readonly db: Db, public readonly name: string) {
        super();
    }
    get(id: string): Promise<T> {
        return this.db.get(this.name, id);
    }
    set(id: string, value: T): Promise<void> {
        return this.db.set(this.name, id, value)
            .then(() => {
                this.emit(DB_VALUE_CHANGE, id)
                this.emit(CHANGE)
            })
    }
    list(): Promise<string[]> {
        return this.db.list(this.name)
    }
    async clear() {
        this.db.clear(this.name);
        this.emit(CHANGE)
    }
}

export class Db extends JDEventSource {
    upgrading = false;

    private _db: IDBDatabase;
    readonly blobs: DbStore<Blob>;
    readonly values: DbStore<string>;
    readonly firmwares: DbStore<Blob>;

    constructor() {
        super();
        this.blobs = new DbStore<Blob>(this, Db.STORE_BLOBS);
        this.values = new DbStore<string>(this, Db.STORE_STORAGE);
        this.firmwares = new DbStore<Blob>(this, Db.STORE_FIRMWARE_BLOBS);
    }

    private get db() {
        return this._db;
    }

    private set db(idb: IDBDatabase) {
        this._db = idb;
        if (this._db)
            this._db.onerror = (event) => {
                this.emit(ERROR, event);
            };
    }

    static DB_VERSION = 17
    static DB_NAME = "JACDAC"
    static STORE_BLOBS = "BLOBS"
    static STORE_FIRMWARE_BLOBS = "STORE_FIRMWARE_BLOBS"
    static STORE_STORAGE = "STORAGE"
    public static create(): Promise<Db> {
        return new Promise((resolve) => {
            // create or upgrade database
            const request = indexedDB.open(Db.DB_NAME, Db.DB_VERSION);
            const db: Db = new Db();
            request.onsuccess = function () {
                db.db = request.result
                resolve(db);
            }
            request.onupgradeneeded = function () {
                console.log(`db: upgrade`)
                db.upgrading = true;
                try {
                    const db = request.result;
                    const stores = db.objectStoreNames
                    if (!stores.contains(Db.STORE_STORAGE))
                        db.createObjectStore(Db.STORE_STORAGE);
                    if (!stores.contains(Db.STORE_FIRMWARE_BLOBS))
                        db.createObjectStore(Db.STORE_FIRMWARE_BLOBS);
                    if (!stores.contains(Db.STORE_BLOBS))
                        db.createObjectStore(Db.STORE_BLOBS);
                    db.onerror = function (event) {
                        console.log("idb error", event);
                    };
                } finally {
                    db.upgrading = false;
                }
            };
        })
    }

    checkUpgrading() {
        if (!this.db || this.upgrading) return delay(100)
        else return Promise.resolve()
    }

    list(table: string): Promise<string[]> {
        return this.checkUpgrading().then(() => new Promise<string[]>((resolve, reject) => {
            try {
                const transaction = this.db.transaction([table], "readonly");
                const blobs = transaction.objectStore(table)
                const request = blobs.getAllKeys()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                request.onsuccess = (event) => resolve((event.target as any).result)
                request.onerror = (event) => {
                    this.emit(ERROR, event)
                    resolve(undefined)
                }
            } catch (e) {
                this.emit(ERROR, e)
                reject(e)
            }
        }))
    }

    get<T>(table: string, id: string): Promise<T> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.checkUpgrading().then(() => new Promise<any>((resolve, reject) => {
            try {
                const transaction = this.db.transaction([table], "readonly");
                const blobs = transaction.objectStore(table)
                const request = blobs.get(id);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                request.onsuccess = (event) => resolve((event.target as any).result)
                request.onerror = (event) => {
                    this.emit(ERROR, event)
                    resolve(undefined)
                }
            } catch (e) {
                this.emit(ERROR, e)
                reject(e)
            }
        }))
    }

    set<T>(table: string, id: string, data: T): Promise<void> {
        return this.checkUpgrading()
            .then(() => new Promise<void>((resolve, reject) => {
                try {
                    const transaction = this.db.transaction([table], "readwrite");
                    const blobs = transaction.objectStore(table)
                    const request = data !== undefined ? blobs.put(data, id) : blobs.delete(id);
                    request.onsuccess = () => {
                        this.emit(CHANGE)
                        resolve()
                    }
                    request.onerror = (event) => {
                        this.emit(ERROR, event)
                        resolve()
                    }
                } catch (e) {
                    this.emit(ERROR, e)
                    reject(e)
                }
            }));
    }

    clear(table: string) {
        return this.checkUpgrading()
            .then(() => new Promise<void>((resolve, reject) => {
                try {
                    const transaction = this.db.transaction([table], "readwrite");
                    const blobs = transaction.objectStore(table)
                    const request = blobs.clear();
                    request.onsuccess = () => {
                        this.emit(CHANGE)
                        resolve()
                    }
                    request.onerror = (event) => {
                        this.emit(ERROR, event)
                        resolve()
                    }
                } catch (e) {
                    this.emit(ERROR, e)
                    reject(e)
                }
            }));
    }
}

export interface DbContextProps {
    db: Db,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
}

const DbContext = createContext<DbContextProps>({
    db: undefined,
    error: undefined
});
DbContext.displayName = "db";

export default DbContext;

// eslint-disable-next-line react/prop-types
export const DbProvider = ({ children }) => {
    const [db, setDb] = useState<Db>(undefined)
    const [error, setError] = useState(undefined)
    useEffectAsync(async () => {
        try {
            const r = await Db.create();
            setDb(r);
        }
        catch (e) {
            setError(e)
        }
    }, []);
    return (
        <DbContext.Provider value={{ db, error }}>
            {children}
        </DbContext.Provider>
    )
}
