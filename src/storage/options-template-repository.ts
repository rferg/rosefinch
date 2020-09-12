import { Repository } from './repository'
import { DbContextFactory } from './db-context-factory'
import { StoreName } from './store-name'
import { DbContext } from './db-context'
import { OptionsTemplateStore } from './options-template-store'
import { Injectable } from 'cewdi'

@Injectable()
export class OptionsTemplateRepository implements Repository<OptionsTemplateStore> {
    private readonly storeName: StoreName = 'optionsTemplate'

    constructor(private readonly dbContextFactory: DbContextFactory) {
    }

    async get(key: string): Promise<OptionsTemplateStore | undefined> {
        return (await this.getDb()).get(this.storeName, key) as Promise<OptionsTemplateStore | undefined>
    }

    async getAll(): Promise<OptionsTemplateStore[] | undefined> {
        return (await this.getDb()).getAll(this.storeName) as Promise<OptionsTemplateStore[] | undefined>
    }

    async add(val: OptionsTemplateStore): Promise<string> {
        return (await this.getDb()).add(this.storeName, val)
    }

    async put(val: OptionsTemplateStore): Promise<string> {
        return (await this.getDb()).put(this.storeName, val)
    }

    async delete(key: string): Promise<void> {
        return (await this.getDb()).delete(this.storeName, key)
    }

    private getDb(): Promise<DbContext> {
        return this.dbContextFactory.getContext()
    }

}
