import { Pitch } from '../common/pitch'
import { ScaleName } from './scale-name'
export interface Scale {
    name?: ScaleName,
    pitches: Pitch[]
}
