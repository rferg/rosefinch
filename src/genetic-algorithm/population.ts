import { Uint8 } from '../common/uint8'

/**
 * Represents a collection of genomes.
 *
 * The underlying representation is a Uint8Array.
 */
export class Population implements IterableIterator<Uint8Array> {
    readonly size: number
    readonly genomeSize: number
    private readonly array: Uint8Array
    private currentIndex = 0

    /**
     * Creates an instance of population.
     * @param options
     * @param options.size the number of genomes
     * @param options.genomeSize the number of genes in a genome
     * @param options.geneFactory [Optional] the function to initialize genes with;
     * if not provided, all genes will be 0
     */
    constructor({ size, genomeSize, geneFactory }: {
        size: number,
        genomeSize: number,
        geneFactory?: (geneIndexInPopulation: number) => Uint8
    }) {
        this.size = Math.max(size || 0, 0)
        this.genomeSize = Math.max(genomeSize || 0, 0)
        if (!(this.size && this.genomeSize)) {
            throw new Error(`Invalid population size: ${size} or genome size ${genomeSize}.`)
        }
        this.array = new Uint8Array(size * genomeSize)
        if (geneFactory) {
            for (let index = 0; index < this.array.length; index++) {
                this.array[index] = geneFactory(index)
            }
        }
    }

    /**
     *
     * @returns The iterator result containing a subarray of the original
     * Uint8Array that represents a genome.  Note that mutating this
     * subarray will alter underlying Uint8Array.
     */
    next(): IteratorResult<Uint8Array, Uint8Array | null> {
        if (this.currentIndex < this.array.length) {
            const nextIndex = this.currentIndex + this.genomeSize
            const result = {
                done: false,
                value: this.array.subarray(this.currentIndex, nextIndex)
            }
            this.currentIndex = nextIndex
            return result
        }
        return { done: true, value: null }
    }

    [Symbol.iterator](): IterableIterator<Uint8Array> {
        return this
    }

    /**
     *
     * @param index the genome index
     * @returns The subarray representing a genome.  Note that mutating this
     * subarray will alter underlying Uint8Array.
     * @throws Out of range exception if index is invalid.
     */
    get(index: number): Uint8Array {
        this.throwIfInvalidIndex(index)
        const firstGeneIndex = index * this.genomeSize
        return this.array.subarray(firstGeneIndex, firstGeneIndex + this.genomeSize)
    }

    private throwIfInvalidIndex(index: number): void {
        if (index < 0 || index >= this.size) {
            throw new Error(`Index ${index} is out of range.`)
        }
    }
}
