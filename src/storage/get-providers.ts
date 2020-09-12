import { Provider } from 'cewdi'
import { ClusterResultRepository } from './cluster-result-repository'
import { DbContextFactory } from './db-context-factory'
import { GeneticAlgorithmOptionsRepository } from './genetic-algorithm-options-repository'
import { GeneticAlgorithmRepository } from './genetic-algorithm-repository'
import { GeneticAlgorithmSummaryRepository } from './genetic-algorithm-summary-repository'
import { OptionsTemplateRepository } from './options-template-repository'

export function getProviders(): Provider[] {
    return [
        ClusterResultRepository,
        DbContextFactory,
        GeneticAlgorithmOptionsRepository,
        GeneticAlgorithmRepository,
        GeneticAlgorithmSummaryRepository,
        OptionsTemplateRepository
    ]
}
