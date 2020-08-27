import { ElementRegistration, Provider } from 'cewdi'

export interface Module {
    providers: Provider[]
    elements: ElementRegistration[]
}
