import { Provider } from 'cewdi'
import { StateMediatorService } from './state-mediator-service'

export function getProviders(): Provider[] {
    return [
        StateMediatorService
    ]
}
