import { Inject, Injectable } from 'cewdi'
import { WebWorkerType } from './web-worker-type'
import { assertUnreachable } from '../../common/assert-unreachable'
import { WorkerEventType } from './worker-event-type'
import { globalEventTargetToken } from '../../common/global-event-target-token'

@Injectable()
export class WorkerFactory {
    private readonly workerCache = new Map<WebWorkerType, Worker>()

    constructor(@Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        this.eventTarget.addEventListener(
            WorkerEventType.Terminated,
            (ev) => this.workerTerminatedListener(ev as CustomEvent<WebWorkerType | undefined>))
    }

    getWorker(type: WebWorkerType): Worker {
        const cachedWorker = this.workerCache.get(type)
        if (cachedWorker) { return cachedWorker }

        const newWorker = this.createWorkerByType(type)
        this.workerCache.set(type, newWorker)
        return newWorker
    }

    private createWorkerByType(type: WebWorkerType): Worker {
        switch (type) {
            case WebWorkerType.GeneticAlgorithm:
                return new Worker('../../genetic-algorithm/worker.ts')
            case WebWorkerType.Clustering:
                return new Worker('../../clustering/worker.ts')
            case WebWorkerType.UserRatedFitness:
                return new Worker('../../user-rated-fitness/worker.ts')
            default:
                assertUnreachable(type, `Invalid worker type ${type}.`)
        }
    }

    private workerTerminatedListener(event: CustomEvent<WebWorkerType | undefined>): void {
        if (event.detail) {
            const workerType = event.detail
            this.workerCache.delete(workerType)
            event.stopPropagation()
        }
    }
}
