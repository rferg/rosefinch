import { Provider } from 'cewdi'
import { ClusterConfigProvider } from './cluster-config-provider'
import { ClusterWorkerService } from './cluster-worker-service'
import { GeneticAlgorithmService } from './genetic-algorithm-service'
import { GeneticAlgorithmWorkerService } from './genetic-algorithm-worker-service'
import { PipelineFactory } from './pipeline-factory'
import { PipelineService } from './pipeline-service'
import { RepresentativeGenesService } from './representative-genes-service'
import { UserRatedFitnessWorkerService } from './user-rated-fitness-worker-service'
import { UuidService } from './uuid-service'
import { WorkerFactory } from './worker-factory'

export function getProviders(): Provider[] {
    return [
        ClusterConfigProvider,
        ClusterWorkerService,
        ClusterWorkerService,
        GeneticAlgorithmService,
        GeneticAlgorithmWorkerService,
        PipelineFactory,
        PipelineService,
        RepresentativeGenesService,
        UserRatedFitnessWorkerService,
        UuidService,
        WorkerFactory
    ]
}
