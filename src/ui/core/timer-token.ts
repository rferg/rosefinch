import { InjectionToken } from 'cewdi'
import { Timer } from './timer'

export const timerToken = new InjectionToken<Timer>('timer')
