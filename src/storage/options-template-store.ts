import { OptionsForm } from './options-form'
import { Store } from './store'

export interface OptionsTemplateStore extends Store, OptionsForm {
    storeName: 'optionsTemplate'
    name: string
    createdOn: Date
    updatedOn: Date
    lastAccessedOn: Date
}
