import { Module } from '../core/module'
import { OptionsElement } from './options.element'
import { InputElement } from './input.element'
import { SizeFormElement } from './size/size-form.element'
import { PopupElement } from './popup.element'
import { RunConfirmFormElement } from './run-confirm-form.element'
import { OptionsFormMapperService } from '../../services/options-form-mapper-service'
import { ChordService, OptionsFormService, ScaleService } from '../../services'
import { getProviders as getNotationProviders } from '../../services/notation'
import { GenomeNotationElement } from './notation/genome-notation.element'
import { ScaleFitnessElement } from './fitness/scale-fitness.element'
import { RestProportionFitnessElement } from './fitness/rest-proportion-fitness.element'
import { RhythmicDispersionFitnessElement } from './fitness/rhythmic-dispersion-fitness.element'
import { PitchSequenceDirectionFitnessElement } from './fitness/pitch-sequence-direction-fitness.element'
import { ChordSelectorElement } from './fitness/chord-selector.element'
import { NoteAdjusterElement } from './fitness/note-adjuster.element'
import { ChordFitnessElement } from './fitness/chord-fitness.element'
import { OptionsNavElement } from './options-nav.element'

export default {
    providers: [
        ChordService,
        OptionsFormMapperService,
        ScaleService,
        OptionsFormService,
        ...getNotationProviders()
    ],
    routes: [
        {
            path: 'size',
            elementName: 'rf-size-form'
        },
        {
            path: 'chord',
            elementName: 'rf-chord-fitness'
        },
        {
            path: 'scale',
            elementName: 'rf-scale-fitness'
        },
        {
            path: 'pitch-sequence-direction',
            elementName: 'rf-pitch-sequence-direction-fitness'
        },
        {
            path: 'rest-proportion',
            elementName: 'rf-rest-proportion-fitness'
        },
        {
            path: 'rhythmic-dispersion',
            elementName: 'rf-rhythmic-dispersion-fitness'
        }
    ],
    elements: [
        {
            element: OptionsElement,
            name: 'rf-options'
        },
        {
            element: InputElement,
            name: 'rf-input'
        },
        {
            element: SizeFormElement,
            name: 'rf-size-form'
        },
        {
            element: PopupElement,
            name: 'rf-popup'
        },
        {
            element: RunConfirmFormElement,
            name: 'rf-run-confirm-form'
        },
        {
            element: GenomeNotationElement,
            name: 'rf-genome-notation'
        },
        {
            element: ScaleFitnessElement,
            name: 'rf-scale-fitness'
        },
        {
            element: RestProportionFitnessElement,
            name: 'rf-rest-proportion-fitness'
        },
        {
            element: RhythmicDispersionFitnessElement,
            name: 'rf-rhythmic-dispersion-fitness'
        },
        {
            element: PitchSequenceDirectionFitnessElement,
            name: 'rf-pitch-sequence-direction-fitness'
        },
        {
            element: ChordSelectorElement,
            name: 'rf-chord-selector'
        },
        {
            element: ChordFitnessElement,
            name: 'rf-chord-fitness'
        },
        {
            element: NoteAdjusterElement,
            name: 'rf-note-adjuster'
        },
        {
            element: OptionsNavElement,
            name: 'rf-options-nav'
        }
    ]
} as Module
