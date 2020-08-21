import { PipelineStageName } from './pipeline-stage-name'

export type PipelineProgressCallback = (report: { stageName: PipelineStageName, detail?: any }) => any
