import { Repository } from './repository'
import { DbContextFactory } from './db-context-factory'
import { StoreName } from './store-name'
import { DbContext } from './db-context'
import { ClusterResultStore } from './cluster-result-store'
import { Injectable } from 'cewdi'

@Injectable()
export class ClusterResultRepository implements Repository<ClusterResultStore> {
    private readonly storeName: StoreName = 'clusterResult'

    constructor(private readonly dbContextFactory: DbContextFactory) {
    }

    async get(key: string): Promise<ClusterResultStore | undefined> {
        return (await this.getDb()).get(this.storeName, key) as Promise<ClusterResultStore | undefined>
    }

    async getAll(): Promise<ClusterResultStore[] | undefined> {
        return (await this.getDb()).getAll(this.storeName) as Promise<ClusterResultStore[] | undefined>
    }

    async add(val: ClusterResultStore): Promise<string> {
        return (await this.getDb()).add(this.storeName, val)
    }

    async put(val: ClusterResultStore): Promise<string> {
        return (await this.getDb()).put(this.storeName, val)
    }

    async delete(key: string): Promise<void> {
        return (await this.getDb()).delete(this.storeName, key)
    }

    private getDb(): Promise<DbContext> {
        return this.dbContextFactory.getContext()
    }

}
