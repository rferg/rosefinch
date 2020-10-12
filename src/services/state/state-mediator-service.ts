import { Inject, Injectable } from 'cewdi'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { updateStateEventType } from './update-state-event-type'
import { StateTopic } from './state-topic'
import { StateService } from './state-service'
import { UpdateStateEvent } from './update-state-event'
import { StateSubscription } from './state-subscription'
import { StateTypeTopicMap } from './state-type-topic-map'

@Injectable()
export class StateMediatorService {
    private readonly services = new Map<StateTopic, StateService<StateTypeTopicMap<StateTopic>>>()

    constructor(@Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        this.eventTarget.addEventListener(updateStateEventType, event => this.onUpdate(event))
    }

    subscribe<T extends StateTopic>(
        topic: T,
        listener: (state: StateTypeTopicMap<T>) => any,
        {
            ifNotMatch
        }: {
            ifNotMatch?: { matcher: (state?: StateTypeTopicMap<StateTopic>) => boolean, action: () => any }
        } = {}): StateSubscription {
        const service = this.getOrAddService(topic)
        const serviceListener = (state?: StateTypeTopicMap<StateTopic>) =>
            listener(state as StateTypeTopicMap<T>)
        service.addListener(serviceListener)

        const currentValue = service.getCurrent()
        if (ifNotMatch && !ifNotMatch.matcher(currentValue)) {
            ifNotMatch.action()
        } else if (currentValue) {
            serviceListener(currentValue)
        }

        return {
            unsubscribe: () => service.removeListener(serviceListener)
        }
    }

    private onUpdate(event: Event): void {
        if (this.isUpdateStateEvent(event)) {
            event.stopPropagation()
            const service = this.getOrAddService(event.topic)
            service.update(_ => event.newState)
        }
    }

    private getOrAddService(topic: StateTopic): StateService<StateTypeTopicMap<StateTopic>> {
        let service = this.services.get(topic)
        if (!service) {
            service = new StateService<StateTypeTopicMap<typeof topic>>()
            this.services.set(topic, service)
        }
        return service
    }

    private isUpdateStateEvent(event: Event): event is UpdateStateEvent<StateTopic> {
        // tslint:disable-next-line: strict-type-predicates
        return (event as UpdateStateEvent<StateTopic>)?.topic !== undefined
    }
}
