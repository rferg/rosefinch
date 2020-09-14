import { ExistingPipelineRunParams } from './existing-pipeline-run-params'
import { NewPipelineRunParams } from './new-pipeline-run-params'

export type PipelineRunParams = NewPipelineRunParams | ExistingPipelineRunParams | { cleared: true }
