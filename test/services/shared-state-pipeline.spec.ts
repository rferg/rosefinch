import { SharedStatePipeline } from '../../src/services/shared-state-pipeline'

describe('SharedStatePipeline', () => {
    describe('run', () => {
        it('should return if stages are empty', async () => {
            const pipeline = new SharedStatePipeline([])
            const state = { prop: 1 }
            const result = await pipeline.run(state)

            expect(result.result).toEqual(state)
            expect(result.isCanceled).toBeFalse()
            expect(result.error).toBeUndefined()
        })
    })
})
