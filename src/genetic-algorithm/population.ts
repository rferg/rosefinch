import { Uint8 } from '../common/uint8'
import { SerializedPopulation } from '../common/serialized-population'

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
     * @param options.array [Optional] for passing in serialized population to be re-created
     * @param options.geneFactory [Optional] the function to initialize genes with;
     * if not provided, all genes will be 0
     */
    constructor({ size, genomeSize, array, geneFactory }: {
        size: number,
        genomeSize: number,
        array?: Uint8Array,
        geneFactory?: (geneIndexInPopulation: number) => Uint8
    }) {
        this.genomeSize = Math.max(genomeSize || 0, 0)

        if (!(size && this.genomeSize)) {
            throw new Error(`Invalid population size: ${size} or genome size ${genomeSize}.`)
        }
        if (array && size !== (array.length / this.genomeSize)) {
            throw new Error(`Invalid population size: ${size} does not match given array length: ` +
                `${array.length} divided by genomeSize ${this.genomeSize}`)
        }

        this.array = array || new Uint8Array(size * genomeSize)
        this.size = Math.floor(this.array.length / this.genomeSize)

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

    /**
     * Serializes population
     * @returns population suitable for being sent over worker messages
     */
    serialize(): SerializedPopulation {
        return {
            size: this.size,
            genomeSize: this.genomeSize,
            array: this.array
        }
    }

    private throwIfInvalidIndex(index: number): void {
        if (index < 0 || index >= this.size) {
            throw new Error(`Index ${index} is out of range.`)
        }
    }
}
