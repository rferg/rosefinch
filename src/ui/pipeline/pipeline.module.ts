import { getProviders } from '../../services/pipeline'
import { Module } from '../core/module'
import { PipelineElement } from './pipeline.element'

export default {
    providers: [
        ...getProviders()
    ],
    elements: [
        {
            element: PipelineElement,
            name: 'rf-pipeline'
        }
    ]
} as Module
