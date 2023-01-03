import { CHANGE, delay, ERROR, IEventSource, JDEventSource } from "jacdac-ts"
import React, { createContext, useState } from "react"
import { UIFlags } from "../jacdac/providerbus"
import useEffectAsync from "./useEffectAsync"

export const DB_VALUE_CHANGE = "dbValueChange"

interface IDbStorage {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(table: string, key: string): Promise<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set(table: string, key: string, value: any): Promise<void>
    list(table: string): Promise<string[]>
    clear(table: string): Promise<void>
}

export class DbStore<T> extends JDEventSource {
    constructor(public readonly db: IDbStorage, public readonly name: string) {
        super()
    }
    get(id: string): Promise<T> {
        return this.db.get(this.name, id)
    }
    async set(id: string, value: T) {
        const current = (await this.db.get(this.name, id)) as T
        if (current !== value) {
            await this.db.set(this.name, id, value)
            this.emit(DB_VALUE_CHANGE, id)
            this.emit(CHANGE)
        }
    }
    list(): Promise<string[]> {
        return this.db.list(this.name)
    }
    async clear() {
        this.db.clear(this.name)
        this.emit(CHANGE)
    }
}

export interface IDb extends IEventSource {
    readonly blobs: DbStore<Blob>
    readonly directories: DbStore<FileSystemDirectoryHandle>
}

class IDBDb extends JDEventSource implements IDbStorage, IDb {
    upgrading = false

    private _db: IDBDatabase
    readonly blobs: DbStore<Blob>
    readonly directories: DbStore<FileSystemDirectoryHandle>

    constructor() {
        super()
        this.blobs = new DbStore<Blob>(this, IDBDb.STORE_BLOBS)
        this.directories = new DbStore<FileSystemDirectoryHandle>(
            this,
            IDBDb.STORE_DIRECTORIES
        )
    }

    private get db() {
        return this._db
    }

    private set db(idb: IDBDatabase) {
        this._db = idb
        if (this._db)
            this._db.onerror = event => {
                this.emit(ERROR, event)
            }
    }

    static DB_VERSION = 19
    static DB_NAME = "DATA_SCIENCE_EDITOR"
    static STORE_BLOBS = "BLOBS"
    static STORE_DIRECTORIES = "FILE_SYSTEM_ACCESS_DIRECTORIES"

    public static create(): Promise<IDBDb> {
        return new Promise(resolve => {
            // create or upgrade database
            const request = indexedDB.open(IDBDb.DB_NAME, IDBDb.DB_VERSION)
            const db: IDBDb = new IDBDb()
            request.onsuccess = function () {
                db.db = request.result
                resolve(db)
            }
            request.onupgradeneeded = function () {
                console.log(`db: upgrade`)
                db.upgrading = true
                try {
                    const db = request.result
                    const stores = db.objectStoreNames
                    if (!stores.contains(IDBDb.STORE_BLOBS))
                        db.createObjectStore(IDBDb.STORE_BLOBS)
                    if (!stores.contains(IDBDb.STORE_DIRECTORIES))
                        db.createObjectStore(IDBDb.STORE_DIRECTORIES)
                    db.onerror = function (event) {
                        console.log("idb error", event)
                    }
                } finally {
                    db.upgrading = false
                }
            }
        })
    }

    checkUpgrading() {
        if (!this.db || this.upgrading) return delay(100)
        else return Promise.resolve()
    }

    list(table: string): Promise<string[]> {
        return this.checkUpgrading().then(
            () =>
                new Promise<string[]>((resolve, reject) => {
                    try {
                        const transaction = this.db.transaction(
                            [table],
                            "readonly"
                        )
                        const blobs = transaction.objectStore(table)
                        const request = blobs.getAllKeys()
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        request.onsuccess = event =>
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolve((event.target as any).result)
                        request.onerror = event => {
                            this.emit(ERROR, event)
                            resolve(undefined)
                        }
                    } catch (e) {
                        this.emit(ERROR, e)
                        reject(e)
                    }
                })
        )
    }

    get<T>(table: string, id: string): Promise<T> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.checkUpgrading().then(
            () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                new Promise<any>((resolve, reject) => {
                    try {
                        const transaction = this.db.transaction(
                            [table],
                            "readonly"
                        )
                        const blobs = transaction.objectStore(table)
                        const request = blobs.get(id)
                        request.onsuccess = event =>
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolve((event.target as any).result)
                        request.onerror = event => {
                            this.emit(ERROR, event)
                            resolve(undefined)
                        }
                    } catch (e) {
                        this.emit(ERROR, e)
                        reject(e)
                    }
                })
        )
    }

    set<T>(table: string, id: string, data: T): Promise<void> {
        return this.checkUpgrading().then(
            () =>
                new Promise<void>((resolve, reject) => {
                    try {
                        const transaction = this.db.transaction(
                            [table],
                            "readwrite"
                        )
                        const blobs = transaction.objectStore(table)
                        const request =
                            data !== undefined
                                ? blobs.put(data, id)
                                : blobs.delete(id)
                        request.onsuccess = () => {
                            this.emit(CHANGE)
                            resolve()
                        }
                        request.onerror = event => {
                            this.emit(ERROR, event)
                            resolve()
                        }
                    } catch (e) {
                        this.emit(ERROR, e)
                        reject(e)
                    }
                })
        )
    }

    clear(table: string) {
        return this.checkUpgrading().then(
            () =>
                new Promise<void>((resolve, reject) => {
                    try {
                        const transaction = this.db.transaction(
                            [table],
                            "readwrite"
                        )
                        const blobs = transaction.objectStore(table)
                        const request = blobs.clear()
                        request.onsuccess = () => {
                            this.emit(CHANGE)
                            resolve()
                        }
                        request.onerror = event => {
                            this.emit(ERROR, event)
                            resolve()
                        }
                    } catch (e) {
                        this.emit(ERROR, e)
                        reject(e)
                    }
                })
        )
    }
}

class MemoryDb extends JDEventSource implements IDb, IDbStorage {
    private readonly tables = {
        [IDBDb.STORE_BLOBS]: {},
        [IDBDb.STORE_DIRECTORIES]: {},
    }
    readonly blobs: DbStore<Blob>
    readonly values: DbStore<string>
    readonly directories: DbStore<FileSystemDirectoryHandle>

    constructor() {
        super()
        this.blobs = new DbStore<Blob>(this, IDBDb.STORE_BLOBS)
        this.directories = new DbStore<FileSystemDirectoryHandle>(
            this,
            IDBDb.STORE_DIRECTORIES
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async get(table: string, key: string): Promise<any> {
        return this.tables[table]?.[key]
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async set(table: string, key: string, value: any): Promise<void> {
        const t = this.tables[table]
        if (t) t[key] = value
    }
    async list(table: string): Promise<string[]> {
        const keys = Object.keys(this.tables[table] || {})
        return keys
    }
    async clear(table: string): Promise<void> {
        const t = this.tables[table]
        if (t) this.tables[table] = {}
    }
}

export interface DbContextProps {
    db: IDb
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
}

const DbContext = createContext<DbContextProps>({
    db: undefined,
    error: undefined,
})
DbContext.displayName = "db"

export default DbContext

// eslint-disable-next-line react/prop-types
export const DbProvider = ({ children }) => {
    const [db, setDb] = useState<IDb>(undefined)
    const [error, setError] = useState(undefined)
    useEffectAsync(async () => {
        if (UIFlags.storage) {
            console.debug(`db: indexeddb`)
            try {
                const r = await IDBDb.create()
                setDb(r)
            } catch (e) {
                setError(e)
            }
        } else {
            console.debug(`db: in memory`)
            setDb(new MemoryDb())
        }
    }, [])
    return (
        <DbContext.Provider value={{ db, error }}>
            {children}
        </DbContext.Provider>
    )
}