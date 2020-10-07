import { InjectionToken } from 'cewdi'
import { InstrumentsConfigType } from './instruments-config-type'

export const instrumentsConfigToken = new InjectionToken<InstrumentsConfigType>('Instruments config')
