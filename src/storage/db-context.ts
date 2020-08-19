import { StoreName } from './store-name'
import { StoreType } from './store-type'

export interface DbContext {
    get(storeName: StoreName, key: string): Promise<StoreType>
    add(storeName: StoreName, val: StoreType): Promise<void>
    put(storeName: StoreName, val: StoreType): Promise<void>
    delete(storeName: StoreName, key: string): Promise<void>
}
