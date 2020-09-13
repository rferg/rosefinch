import { getProviders } from '../../services/pipeline'
import { Module } from '../core/module'
import { PipelineElement } from './pipeline.element'
import { ProgressBarElement } from './progress-bar.element'

export default {
    providers: [
        ...getProviders()
    ],
    elements: [
        {
            element: PipelineElement,
            name: 'rf-pipeline'
        },
        {
            element: ProgressBarElement,
            name: 'rf-progress-bar'
        }
    ]
} as Module
