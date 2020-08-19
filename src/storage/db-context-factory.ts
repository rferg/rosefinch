import { DbContext } from './db-context'
import { IDBPDatabase, openDB } from 'idb'
import { Schema } from './schema'
import { StoreName } from './store-name'
import { StoreType } from './store-type'

export class DbContextFactory {
    private context?: DbContext
    private readonly dbName = 'rosefinchDB'
    private readonly version = 1

    constructor() {
    }

    async getContext(): Promise<DbContext> {
        if (this.context) {
            return Promise.resolve(this.context)
        }
        return this.createContext()
    }

    private async createContext(): Promise<DbContext> {
        return openDB<Schema>(this.dbName, this.version, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('optionsTemplate')) {
                    db.createObjectStore('optionsTemplate', {
                        keyPath: 'id'
                    })
                }

                if (!db.objectStoreNames.contains('geneticAlgorithmSummary')) {
                    const summaryStore = db.createObjectStore('optionsTemplate', {
                        keyPath: 'id'
                    })

                    // Seems to be sum bug with idb types, where index names in
                    // the Schema are not parsed correctly.
                    if (!summaryStore.indexNames.contains('by-lastRunOn' as never)) {
                        summaryStore.createIndex('by-lastRunOn' as never, 'lastRunOn')
                    }
                }

                if (!db.objectStoreNames.contains('geneticAlgorithm')) {
                    db.createObjectStore('geneticAlgorithm', {
                        keyPath: 'id'
                    })
                }
            }
        }).then(db => {
            const context = new IDBPContextWrapper(db)
            this.context = context
            return context
        })
    }
}

class IDBPContextWrapper implements DbContext {

    constructor(private readonly idbp: IDBPDatabase<Schema>) {

    }

    get(storeName: StoreName, key: string): Promise<StoreType> {
        return this.idbp.get(storeName, key)
    }

    add(storeName: StoreName, val: StoreType): Promise<void> {
        return this.add(storeName, val)
    }

    put(storeName: StoreName, val: StoreType): Promise<void> {
        return this.put(storeName, val)
    }

    delete(storeName: StoreName, key: string): Promise<void> {
        return this.idbp.delete(storeName, key)
    }
}
