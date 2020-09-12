import { StoreType } from './store-type'

export interface Repository<TStore extends StoreType> {
    get(key: string): Promise<TStore | undefined>
    getAll(): Promise<TStore[] | undefined>
    add(val: TStore): Promise<string>
    put(val: TStore): Promise<string>
    delete(key: string): Promise<void>
}
