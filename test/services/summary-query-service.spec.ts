import { SummaryQueryService } from '../../src/services/summary-query-service'
import { GeneticAlgorithmSummaryRepository, GeneticAlgorithmSummaryStore } from '../../src/storage'

describe('SummaryQueryService', () => {
    let repoSpy: jasmine.SpyObj<GeneticAlgorithmSummaryRepository>
    let service: SummaryQueryService

    beforeEach(() => {
        repoSpy = jasmine.createSpyObj<GeneticAlgorithmSummaryRepository>(
            'GeneticAlgorithmSummaryRepository',
            [ 'getAll' ])
        service = new SummaryQueryService(repoSpy)

        repoSpy.getAll.and.returnValue(Promise.resolve([]))
    })

    it('should call repo.getAll', async () => {
        await service.getRecent()

        expect(repoSpy.getAll).toHaveBeenCalled()
    })

    it('should return empty array if repo returns undefined', async () => {
        const result = await service.getRecent()

        expect(result.length).toBe(0)
    })

    it('should return no more than take value', async () => {
        const summaries = [
            { lastRunOn: new Date() },
            { lastRunOn: new Date() },
            { lastRunOn: new Date() },
            { lastRunOn: new Date() },
            { lastRunOn: new Date() }
        ] as GeneticAlgorithmSummaryStore[]
        repoSpy.getAll.and.returnValue(Promise.resolve(summaries))

        for (let take = 0; take <= summaries.length + 1; take++) {
            const result = await service.getRecent(take)
            if (take <= summaries.length) {
                expect(result.length).toEqual(take)
            } else {
                expect(result.length).toEqual(summaries.length)
            }
        }
    })

    it('should return all if take is undefined', async () => {
        const summaries = [
            { lastRunOn: new Date() },
            { lastRunOn: new Date() },
            { lastRunOn: new Date() },
            { lastRunOn: new Date() },
            { lastRunOn: new Date() }
        ] as GeneticAlgorithmSummaryStore[]
        repoSpy.getAll.and.returnValue(Promise.resolve(summaries))

        const result = await service.getRecent()

        expect(result.length).toEqual(summaries.length)
    })

    it('should return top N summaries sorted by lastRunOn descending', async () => {
        const summaries = [
            { lastRunOn: new Date(1, 1, 2020) },
            { lastRunOn: new Date(1, 1, 2019) },
            { lastRunOn: new Date(2, 1, 2019) },
            { lastRunOn: new Date(3, 1, 2019) },
            { lastRunOn: new Date(2, 1, 2020) }
        ] as GeneticAlgorithmSummaryStore[]
        const take = 3
        const expected = [ ...summaries ].sort((a, b) => a.lastRunOn > b.lastRunOn ? -1 : 1).slice(0, take)
        repoSpy.getAll.and.returnValue(Promise.resolve(summaries))

        const result = await service.getRecent(take)

        expect(result).toEqual(expected)
    })
})
