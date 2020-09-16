import { SerializedPopulation } from '../../../src/genetic-algorithm'
import { RepresentativeGenesService } from '../../../src/services/pipeline'
import { ClusterResultRepository, ClusterResultStore, GeneticAlgorithmRepository, GeneticAlgorithmStore } from '../../../src/storage'

describe('RepresentativeGenesService', () => {
    let service: RepresentativeGenesService
    let gaRepoSpy: jasmine.SpyObj<GeneticAlgorithmRepository>
    let clusterRepoSpy: jasmine.SpyObj<ClusterResultRepository>

    beforeEach(() => {
        gaRepoSpy = jasmine.createSpyObj<GeneticAlgorithmRepository>('GeneticAlgorithmRepository', [ 'get' ])
        gaRepoSpy.get.and.returnValue(Promise.resolve(undefined))
        clusterRepoSpy = jasmine.createSpyObj<ClusterResultRepository>('ClusterResultRepository', [ 'get' ])
        clusterRepoSpy.get.and.returnValue(Promise.resolve(undefined))

        service = new RepresentativeGenesService(gaRepoSpy, clusterRepoSpy)
    })

    describe('getGenes', () => {
        it('should return empty if GA does not exist', async () => {
            const id = 'a'
            const result = await service.getGenes(id)

            expect(result).toEqual([])
            expect(gaRepoSpy.get).toHaveBeenCalledWith(id)
        })

        it('should return empty if GA.population is undefined', async () => {
            const id = 'a'
            gaRepoSpy.get.and.returnValue(Promise.resolve({} as GeneticAlgorithmStore))

            const result = await service.getGenes(id)

            expect(result).toEqual([])
            expect(gaRepoSpy.get).toHaveBeenCalledWith(id)
        })

        it('should return empty if cluster result does not exist', async () => {
            const id = 'a'
            gaRepoSpy.get.and.returnValue(Promise.resolve({
                population: { size: 1, genomeSize: 1, array: new Uint8Array(1) }
            } as GeneticAlgorithmStore))

            const result = await service.getGenes(id)

            expect(result).toEqual([])
            expect(gaRepoSpy.get).toHaveBeenCalledWith(id)
            expect(clusterRepoSpy.get).toHaveBeenCalledWith(id)
        })

        it('should return empty if cluster result representativeIndexes is undefined', async () => {
            const id = 'a'
            gaRepoSpy.get.and.returnValue(Promise.resolve({
                population: { size: 1, genomeSize: 1, array: new Uint8Array(1) }
            } as GeneticAlgorithmStore))
            clusterRepoSpy.get.and.returnValue(Promise.resolve({} as ClusterResultStore))

            const result = await service.getGenes(id)

            expect(result).toEqual([])
            expect(gaRepoSpy.get).toHaveBeenCalledWith(id)
            expect(clusterRepoSpy.get).toHaveBeenCalledWith(id)
        })

        it('should return empty if GA repo throws', async () => {
            gaRepoSpy.get.and.throwError(new Error())

            const result = await service.getGenes('')

            expect(result).toEqual([])
        })

        it('should return empty if cluster result repo throws', async () => {
            gaRepoSpy.get.and.returnValue(Promise.resolve({
                population: { size: 1, genomeSize: 1, array: new Uint8Array(1) }
            } as GeneticAlgorithmStore))
            clusterRepoSpy.get.and.throwError(new Error())

            const result = await service.getGenes('')

            expect(result).toEqual([])
        })

        it('should call extractGenes with population and representativeIndexes', async () => {
            const population: SerializedPopulation = { size: 1, genomeSize: 1, array: new Uint8Array(1) }
            const representativeIndexes: (number | undefined)[] = [ 0 ]
            gaRepoSpy.get.and.returnValue(Promise.resolve({
                population
            } as GeneticAlgorithmStore))
            clusterRepoSpy.get.and.returnValue(Promise.resolve({
                representativeIndexes
            } as ClusterResultStore))
            const spy = spyOn(service, 'extractGenes').and.callThrough()

            const result = await service.getGenes('')

            expect(spy).toHaveBeenCalledWith(population, representativeIndexes)
            expect(result).toEqual(spy.calls.mostRecent().returnValue)
        })
    })

    describe('extractGenes', () => {
        const testCases: {
            population: SerializedPopulation,
            representativeIndexes: (number | undefined)[]
            expected: (number[] | undefined)[]
        }[] = [
            {
                population: {
                    size: 3,
                    genomeSize: 3,
                    array: new Uint8Array([ 0, 0, 0, 1, 1, 1, 2, 2, 2 ])
                },
                representativeIndexes: [ 1, 0, 2 ],
                expected: [
                    [ 1, 1, 1 ],
                    [ 0, 0, 0 ],
                    [ 2, 2, 2 ]
                ]
            },
            {
                population: {
                    size: 2,
                    genomeSize: 4,
                    array: new Uint8Array([ 0, 0, 0, 0, 1, 1, 1, 1 ])
                },
                representativeIndexes: [ 0, 1 ],
                expected: [
                    [ 0, 0, 0, 0 ],
                    [ 1, 1, 1, 1 ]
                ]
            },
            {
                population: {
                    size: 3,
                    genomeSize: 4,
                    array: new Uint8Array([ 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2 ])
                },
                representativeIndexes: [ 2, 0 ],
                expected: [
                    [ 2, 2, 2, 2 ],
                    [ 0, 0, 0, 0 ]
                ]
            },
            {
                population: {
                    size: 3,
                    genomeSize: 4,
                    array: new Uint8Array([ 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2 ])
                },
                representativeIndexes: [ 2, undefined ],
                expected: [
                    [ 2, 2, 2, 2 ],
                    undefined
                ]
            },
            {
                population: {
                    size: 3,
                    genomeSize: 4,
                    array: undefined
                },
                representativeIndexes: [ 2 ],
                expected: [ undefined ]
            }
        ]

        testCases.forEach(({ population, representativeIndexes, expected }) => {
            it(`should return ${expected} with ${representativeIndexes}`, async () => {
                const result = service.extractGenes(population, representativeIndexes)

                expect(result).toEqual(expected)
            })
        })
    })
})
