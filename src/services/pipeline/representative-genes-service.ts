import { Injectable } from 'cewdi'
import { SerializedPopulation } from '../../genetic-algorithm'
import { ClusterResultRepository, GeneticAlgorithmRepository } from '../../storage'

@Injectable()
export class RepresentativeGenesService {

    constructor(
        private readonly gaRepo: GeneticAlgorithmRepository,
        private readonly clusterRepo: ClusterResultRepository) {}

    async getGenes(geneticAlgorithmId: string): Promise<(number[] | undefined)[]> {
        try {
            const population = (await this.gaRepo.get(geneticAlgorithmId))?.population
            if (!population) { return [] }

            const representativeIndexes = (await this.clusterRepo.get(geneticAlgorithmId))?.representativeIndexes
            if (!representativeIndexes) { return [] }

            return this.extractGenes(population, representativeIndexes)
        } catch (error) {
            console.error(error)
            return []
        }
    }

    extractGenes(
        population: SerializedPopulation,
        representativeIndexes: (number | undefined)[]): (number[] | undefined)[] {
            const genomeSize = population.genomeSize
            return representativeIndexes
                .map(repIdx => {
                    if (repIdx === undefined) { return undefined }
                    const genes = population.array
                        ?.slice(repIdx * genomeSize, (repIdx * genomeSize) + genomeSize)
                    if (!(genes && genes.length)) { return undefined }
                    return [ ...genes ]
                })
    }
}
