import { FitnessForm } from './fitness-form'
import { SizeForm } from './size-form'

export interface OptionsForm extends FitnessForm {
    size: SizeForm
}
