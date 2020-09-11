import { Injectable } from 'cewdi'
import { SerializedGeneticAlgorithmOptions } from '../genetic-algorithm'
import { FitnessForm } from '../ui/options/fitness-form'
import { SizeForm } from '../ui/options/size-form'

@Injectable()
export class OptionsMappingService {
    mapSizeForm(
        sizeForm: SizeForm,
        options?: SerializedGeneticAlgorithmOptions): SerializedGeneticAlgorithmOptions {
            throw new Error('not implemented' + sizeForm + options)
    }

    mapFitnessForm(
        fitnessForm: FitnessForm,
        options?: SerializedGeneticAlgorithmOptions): SerializedGeneticAlgorithmOptions {
            throw new Error('not implemented' + fitnessForm + options)

    }
}
