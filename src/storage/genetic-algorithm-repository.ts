import { Repository } from './repository'
import { GeneticAlgorithmStore } from './genetic-algorithm-store'
import { DbContextFactory } from './db-context-factory'
import { StoreName } from './store-name'
import { DbContext } from './db-context'

export class GeneticAlgorithmRepository implements Repository<GeneticAlgorithmStore> {
    private readonly storeName: StoreName = 'geneticAlgorithm'

    constructor(private readonly dbContextFactory: DbContextFactory) {
    }

    async get(key: string): Promise<GeneticAlgorithmStore | undefined> {
        return (await this.getDb()).get(this.storeName, key) as Promise<GeneticAlgorithmStore | undefined>
    }

    async getAll(): Promise<GeneticAlgorithmStore[] | undefined> {
        return (await this.getDb()).getAll(this.storeName) as Promise<GeneticAlgorithmStore[] | undefined>
    }

    async add(val: GeneticAlgorithmStore): Promise<string> {
        return (await this.getDb()).add(this.storeName, val)
    }

    async put(val: GeneticAlgorithmStore, key: string): Promise<string> {
        return (await this.getDb()).put(this.storeName, val, key)
    }

    async delete(key: string): Promise<void> {
        return (await this.getDb()).delete(this.storeName, key)
    }

    private getDb(): Promise<DbContext> {
        return this.dbContextFactory.getContext()
    }

}
