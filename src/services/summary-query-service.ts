import { Injectable } from 'cewdi'
import { GeneticAlgorithmSummaryRepository, GeneticAlgorithmSummaryStore } from '../storage'

@Injectable()
export class SummaryQueryService {

    constructor(private readonly summaryRepo: GeneticAlgorithmSummaryRepository) {}

    async getRecent(take = 3): Promise<GeneticAlgorithmSummaryStore[]> {
        return (await this.summaryRepo.getAll() || [])
            .sort((a, b) => a.lastRunOn < b.lastRunOn ? 1 : -1)
            .slice(0, take)
    }
}
