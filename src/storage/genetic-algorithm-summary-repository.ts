import { Repository } from './repository'
import { DbContextFactory } from './db-context-factory'
import { StoreName } from './store-name'
import { DbContext } from './db-context'
import { GeneticAlgorithmSummaryStore } from './genetic-algorithm-summary-store'
import { Injectable } from 'cewdi'

@Injectable()
export class GeneticAlgorithmSummaryRepository implements Repository<GeneticAlgorithmSummaryStore> {
    private readonly storeName: StoreName = 'geneticAlgorithmSummary'

    constructor(private readonly dbContextFactory: DbContextFactory) {
    }

    async get(key: string): Promise<GeneticAlgorithmSummaryStore | undefined> {
        return (await this.getDb()).get(this.storeName, key) as Promise<GeneticAlgorithmSummaryStore | undefined>
    }

    async getAll(): Promise<GeneticAlgorithmSummaryStore[] | undefined> {
        return (await this.getDb()).getAll(this.storeName) as Promise<GeneticAlgorithmSummaryStore[] | undefined>
    }

    async add(val: GeneticAlgorithmSummaryStore): Promise<string> {
        return (await this.getDb()).add(this.storeName, val)
    }

    async put(val: GeneticAlgorithmSummaryStore): Promise<string> {
        return (await this.getDb()).put(this.storeName, val)
    }

    async delete(key: string): Promise<void> {
        return (await this.getDb()).delete(this.storeName, key)
    }

    private getDb(): Promise<DbContext> {
        return this.dbContextFactory.getContext()
    }

}
