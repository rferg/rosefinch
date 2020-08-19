import { DBSchema } from 'idb'
import { GeneticAlgorithmStore } from './genetic-algorithm-store'
import { OptionsTemplateStore } from './options-template-store'

export interface Schema extends DBSchema {
    geneticAlgorithm: {
        key: string,
        value: GeneticAlgorithmStore
    }
    optionsTemplate: {
        key: string,
        value: OptionsTemplateStore
    }
}
