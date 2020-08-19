import { StoreName } from './store-name'
import { StoreType } from './store-type'

export interface DbContext {
    get(storeName: StoreName, key: string): Promise<StoreType | undefined>
    getAll(storeName: StoreName): Promise<StoreType[] | undefined>
    add(storeName: StoreName, val: StoreType): Promise<string>
    put(storeName: StoreName, val: StoreType, key: string): Promise<string>
    delete(storeName: StoreName, key: string): Promise<void>
}
