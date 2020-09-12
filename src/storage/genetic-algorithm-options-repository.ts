import { Repository } from './repository'
import { GeneticAlgorithmOptionsStore } from './genetic-algorithm-options-store'
import { DbContext } from './db-context'
import { StoreName } from './store-name'
import { DbContextFactory } from './db-context-factory'
import { Injectable } from 'cewdi'

@Injectable()
export class GeneticAlgorithmOptionsRepository implements Repository<GeneticAlgorithmOptionsStore> {
    private readonly storeName: StoreName = 'geneticAlgorithmOptions'

    constructor(private readonly dbContextFactory: DbContextFactory) {
    }

    async get(key: string): Promise<GeneticAlgorithmOptionsStore | undefined> {
        return (await this.getDb()).get(this.storeName, key) as Promise<GeneticAlgorithmOptionsStore | undefined>
    }

    async getAll(): Promise<GeneticAlgorithmOptionsStore[] | undefined> {
        return (await this.getDb()).getAll(this.storeName) as Promise<GeneticAlgorithmOptionsStore[] | undefined>
    }

    async add(val: GeneticAlgorithmOptionsStore): Promise<string> {
        return (await this.getDb()).add(this.storeName, val)
    }

    async put(val: GeneticAlgorithmOptionsStore): Promise<string> {
        return (await this.getDb()).put(this.storeName, val)
    }

    async delete(key: string): Promise<void> {
        return (await this.getDb()).delete(this.storeName, key)
    }

    private getDb(): Promise<DbContext> {
        return this.dbContextFactory.getContext()
    }
}
