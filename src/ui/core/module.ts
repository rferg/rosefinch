import { ElementRegistration, Provider } from 'cewdi'
import { Route } from './route'

export interface Module {
    providers: Provider[]
    elements: ElementRegistration[],
    routes?: Route[]
}
