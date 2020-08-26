import { PipelineProgressReport } from './pipeline/pipeline-progress-report'
import { pipelineProgressEventType } from './pipeline-progress-event-type'

export class PipelineProgressEvent extends CustomEvent<PipelineProgressReport> {
    get report(): PipelineProgressReport {
        return this.detail
    }

    constructor(report: PipelineProgressReport) {
        super(pipelineProgressEventType, { detail: report, bubbles: true })
    }
}
