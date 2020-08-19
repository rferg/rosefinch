import { StoreType } from './store-type'

export interface Repository<TStore extends StoreType> {
    get(key: string): Promise<TStore | undefined>
    add(val: TStore): Promise<void>
    put(val: TStore, key: string): Promise<void>
    delete(key: string): Promise<void>
}
