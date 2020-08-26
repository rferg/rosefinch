import { StateTopic } from './state-topic'
import { updateStateEventType } from './update-state-event-type'
import { StateTypeTopicMap } from './state-type-topic-map'

export class UpdateStateEvent<TTopic extends StateTopic> extends CustomEvent<StateTypeTopicMap<TTopic>> {
    readonly topic: TTopic

    get newState(): StateTypeTopicMap<TTopic> {
        return this.detail
    }

    constructor(topic: TTopic, newState: StateTypeTopicMap<TTopic>) {
        super(updateStateEventType, { detail: newState, bubbles: true })
        this.topic = topic
    }
}
