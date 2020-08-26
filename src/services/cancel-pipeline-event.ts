import { cancelPipelineEventType } from './cancel-pipeline-event-type'

export class CancelPipelineEvent extends CustomEvent<void> {

    constructor() {
        super(cancelPipelineEventType, { bubbles: true })
    }
}
