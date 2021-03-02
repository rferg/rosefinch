import { property } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../src/genetic-algorithm'
import { DenominatedNote } from '../../src/services/notation'
import { BaseElement } from '../../src/ui/core/base-element'

export class GenomeNotationElementStub extends BaseElement {
    static get is() { return 'rf-genome-notation' }

    @property()
    genome?: number[] | number[][]

    @property()
    options?: SerializedGeneticAlgorithmOptions

    @property()
    clickListener?: (note: DenominatedNote) => void
}
