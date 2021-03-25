import { Injectable } from 'cewdi'
import { OptionsForm, OptionsTemplateRepository, OptionsTemplateStore } from '../storage'
import { UuidService } from '../common/uuid-service'

interface SuccessResponse<T> {
    isSuccessful: boolean
    errorMessage?: string
    result?: T
}

@Injectable()
export class OptionsTemplateService {

    constructor(
        private readonly repo: OptionsTemplateRepository,
        private readonly uuid: UuidService) {}

    async add(form: OptionsForm, name: string): Promise<SuccessResponse<OptionsTemplateStore>> {
        if (!form) {
            throw new Error(`Form was ${form}`)
        }
        if (!name) {
            return { isSuccessful: false, errorMessage: 'Name is required' }
        }

        const now = new Date()
        const store: OptionsTemplateStore = {
            id: this.uuid.getUuid(),
            storeName: 'optionsTemplate',
            ...form,
            name,
            createdOn: now,
            updatedOn: now,
            lastAccessedOn: now
        }

        try {
            await this.repo.add(store)
            return { isSuccessful: true, result: store }
        } catch (error) {
            console.error(error)
            return { isSuccessful: false, errorMessage: 'Unable to save options template.' }
        }
    }

    async put(store: OptionsTemplateStore): Promise<SuccessResponse<OptionsTemplateStore>> {
        try {
            store.updatedOn = new Date()
            await this.repo.put(store)
            return { isSuccessful: true, result: store }
        } catch (error) {
            console.error(error)
            return { isSuccessful: false, errorMessage: 'Unable to update options template.' }
        }
    }

    async getRecent(take?: number): Promise<{ id: string, name: string, lastAccessedOn: Date }[]> {
        return (await this.repo.getAll() || [])
            .map(({ id, name, lastAccessedOn }) => ({ id, name, lastAccessedOn }))
            .sort((a, b) => a.lastAccessedOn > b.lastAccessedOn ? -1 : 1)
            .slice(0, take)
    }

    async get(id: string): Promise<OptionsTemplateStore | undefined> {
        const store = await this.repo.get(id)
        if (!store) { return undefined }

        store.lastAccessedOn = new Date()
        const updateResult = await this.put(store)
        return updateResult.result
    }
}
