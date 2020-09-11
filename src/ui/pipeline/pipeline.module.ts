import { Module } from '../core/module'
import { PipelineElement } from './pipeline.element'

export default {
    providers: [
        // TODO
    ],
    elements: [
        {
            element: PipelineElement,
            name: 'rf-pipeline'
        }
    ]
} as Module
