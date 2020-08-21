import { SharedStatePipeline } from '../../src/services/shared-state-pipeline'
import { PipelineStageName } from '../../src/services/pipeline-stage-name'
import { PipelineStage } from '../../src/services/pipeline-stage'

const getStageSpy = <T>(name: PipelineStageName) => {
    const stage = jasmine.createSpyObj<PipelineStage<T>>('PipelineStage', [ 'execute', 'rollback' ], { name })
    stage.execute.and.returnValue({
        cancel: jasmine.createSpy('cancel'),
        result: Promise.resolve({} as T)
    })
    stage.rollback.and.returnValue(Promise.resolve())
    return stage
}

interface State {
    [key: number]: number
}

describe('SharedStatePipeline', () => {
    describe('run + cancel', () => {
        it('should return if stages are empty', async () => {
            const pipeline = new SharedStatePipeline([])
            const state = { prop: 1 }
            const result = await pipeline.run(state)

            expect(result.result).toEqual(state)
            expect(result.isCanceled).toBeFalse()
            expect(result.error).toBeUndefined()
        })

        it('should run all stages and return accumulated result', async () => {
            const initialState: State = {}
            const stages = [
                PipelineStageName.GetClusterResult,
                PipelineStageName.GetGeneticAlgorithm,
                PipelineStageName.GetRepresentativeGenes
            ].map(name => getStageSpy<State>(name))
            stages.forEach((stage, i) => stage.execute.and.returnValue(
                {
                    result: Promise.resolve({ [i]: i }),
                    cancel: jasmine.createSpy(`${stage.name} cancel`, () => Promise.resolve())
                }
            ))
            const pipeline = new SharedStatePipeline(stages)

            const result = await pipeline.run(initialState)

            expect(result.isCanceled).toBeFalse()
            expect(result.result).toEqual({ 0: 0, 1: 1, 2: 2 })
            expect(result.error).toBeUndefined()
        })

        it('should pass along progressCallback to stage', async () => {
            const initialState: State = {}
            const stage = getStageSpy<State>(PipelineStageName.GetClusterResult)
            const pipeline = new SharedStatePipeline([ stage ])
            const progressCallback = jasmine.createSpy('progressCallback')

            await pipeline.run(initialState, progressCallback)

            expect(stage.execute).toHaveBeenCalledWith(initialState, progressCallback)
        })

        it('should rollback all completed and running stages if one fails', async () => {
            const initialState: State = { 0: 0 }
            const failedStageIndex = 1
            const errorMessage = 'TEST REJECT'
            const stages = [
                PipelineStageName.GetClusterResult,
                PipelineStageName.GetGeneticAlgorithm,
                PipelineStageName.GetRepresentativeGenes
            ].map(name => getStageSpy<State>(name))
            const cancelSpy = jasmine.createSpy('cancel')
            stages[failedStageIndex].execute.and.returnValue({
                cancel: cancelSpy,
                result: Promise.reject(errorMessage)
            })
            const pipeline = new SharedStatePipeline(stages)

            const result = await pipeline.run(initialState)

            expect(result.result).toEqual(initialState)
            expect(result.error).toEqual({
                stageName: stages[failedStageIndex].name,
                input: initialState,
                error: errorMessage
            })
            expect(cancelSpy).not.toHaveBeenCalled()
            stages.forEach((stage, i) => {
                if (i <= failedStageIndex) {
                    expect(stage.rollback).toHaveBeenCalled()
                } else {
                    expect(stage.execute).not.toHaveBeenCalled()
                    expect(stage.rollback).not.toHaveBeenCalled()
                }
            })
        })

        it('should cancel current and rollback if stage canceled', async () => {
            const initialState: State = { 0: 0 }
            const canceledStageIndex = 1
            const stages = [
                PipelineStageName.GetClusterResult,
                PipelineStageName.GetGeneticAlgorithm,
                PipelineStageName.GetRepresentativeGenes
            ].map(name => getStageSpy<State>(name))
            const pipeline = new SharedStatePipeline(stages)
            stages[canceledStageIndex].execute.and.callFake(() => {
                return {
                    cancel: jasmine.createSpy('cancel'),
                    result: new Promise(async (resolve) => {
                        await pipeline.cancel()
                        resolve(initialState)
                    })
                }
            })

            const result = await pipeline.run(initialState)

            expect(result.result).toEqual(initialState)
            expect(result.error).toBeUndefined()
            stages.forEach((stage, i) => {
                if (i <= canceledStageIndex) {
                    expect(stage.rollback).toHaveBeenCalled()
                } else {
                    expect(stage.execute).not.toHaveBeenCalled()
                    expect(stage.rollback).not.toHaveBeenCalled()
                }
            })
        })
    })
})
