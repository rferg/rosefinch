import { Injectable } from 'cewdi'
import {
    CrossoverMethod,
    FitnessConfig,
    MutationMethod,
    SelectionMethod,
    SerializedGeneticAlgorithmOptions
} from '../genetic-algorithm'
import { FitnessForm } from './fitness-form'
import { SizeForm } from './size-form'

@Injectable()
export class OptionsFormMapperService {
    private readonly defaultOptions: SerializedGeneticAlgorithmOptions = {
        crossoverMethod: CrossoverMethod.HybridPoint,
        mutationConfig: {
            method: MutationMethod.Point,
            mutationRate: 0.05
        },
        selectionConfig: {
            method: SelectionMethod.Tournament,
            tournamentSize: 2
        },
        fitnessConfigs: [],
        geneFactoryOptions: {
            octaveRange: [ 3, 6 ],
            excludedPitches: []
        },
        timeSignature: [ 4, 4 ],
        measures: 4,
        shortestNoteDuration: 8
    }

    mapSizeForm(
        sizeForm: SizeForm,
        current?: SerializedGeneticAlgorithmOptions): SerializedGeneticAlgorithmOptions {
            current = current || this.defaultOptions
            return {
                ...current,
                timeSignature: [ sizeForm.timeSignatureTop, sizeForm.timeSignatureBottom ],
                measures: sizeForm.measures,
                geneFactoryOptions: {
                    ...current.geneFactoryOptions,
                    octaveRange: [ sizeForm.octaveMin, sizeForm.octaveMax ]
                },
                shortestNoteDuration: sizeForm.shortestNoteDuration
            }
    }

    mapFitnessForm(
        fitnessForm: FitnessForm,
        current?: SerializedGeneticAlgorithmOptions): SerializedGeneticAlgorithmOptions {
            current = current || this.defaultOptions
            return {
                ...current,
                fitnessConfigs: this.getFitnessConfigsFromForm(fitnessForm)
            }
    }

    private getFitnessConfigsFromForm(fitnessForm: FitnessForm): FitnessConfig[] {
        return Object.keys(fitnessForm)
            .map(key => fitnessForm[key as keyof FitnessForm])
            .filter(({ weight, options }) => !!(weight && options))
    }
}
