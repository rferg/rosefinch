import { Normalizer } from '../../src/common/normalizer'
import { FitnessUpdater } from '../../src/user-rated-fitness/fitness-updater'
import { ClusterResult } from '../../src/clustering'

describe('FitnessUpdater', () => {
    let normalizerSpy: jasmine.Spy<Normalizer>
    let updater: FitnessUpdater

    beforeEach(() => {
        normalizerSpy = jasmine.createSpy<Normalizer>('normalizer', (x: Int8Array | Int16Array) => new Int8Array(x))
            .and.callThrough()
        updater = new FitnessUpdater(normalizerSpy)
    })

    it('should return original fitnessValues if no defined representativeIndexes', () => {
        const fitnessValues = new Int8Array([ 1, 2, 3 ])

        const result = updater.update({
            fitnessValues,
            clusterResult: { assignments: [], representativeIndexes: [] },
            userRepresentativeRatings: [ 1, 2 ]
        })

        expect(result).toBe(fitnessValues)
    })

    it('should return original fitnessValues if no defined userRepresentativeRatings', () => {
        const fitnessValues = new Int8Array([ 1, 2, 3 ])

        const result = updater.update({
            fitnessValues,
            clusterResult: { assignments: [], representativeIndexes: [ 1, 2 ] },
            userRepresentativeRatings: [ undefined, undefined ]
        })

        expect(result).toBe(fitnessValues)
    })

    it('should normalize', () => {
        const fitnessValues = new Int8Array([ 1, 2, 3 ])

        updater.update({
            fitnessValues,
            clusterResult: {
                assignments: [
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 1
                    }
                ],
                representativeIndexes: [ 0 ]
            },
            userRepresentativeRatings: [ 0 ]
        })

        expect(normalizerSpy).toHaveBeenCalledWith(new Int16Array(fitnessValues))
    })

    it('should use 1 as minimum distance value to avoid division by 0', () => {
        const fitnessValues = new Int8Array([ 1, 2 ])

        const results = updater.update({
            fitnessValues,
            clusterResult: {
                assignments: [
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 0
                    },
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 0.5
                    }
                ],
                representativeIndexes: [ 0 ]
            },
            userRepresentativeRatings: [ 0 ]
        })

        expect(results).toEqual(fitnessValues)
    })

    it('should apply fitness factor weight', () => {
        const fitnessValues = new Int8Array([ 1, 2 ])
        const rating = 1
        const weight = 2

        const results = updater.update({
            fitnessValues,
            clusterResult: {
                assignments: [
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 1
                    },
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 1
                    }
                ],
                representativeIndexes: [ 0 ]
            },
            userRepresentativeRatings: [ rating ],
            weight
        })

        expect(results).toEqual(fitnessValues.map(value => value + rating * weight))
    })

    it('should weight by distance', () => {
        const fitnessValues = new Int8Array([ 1, 1 ])
        const rating = 4

        const results = updater.update({
            fitnessValues,
            clusterResult: {
                assignments: [
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 2.1
                    },
                    {
                        clusterIndex: 0,
                        // Distance is 4x representative, so should be + rounded quarter of rating
                        distanceToCentroid: 8.4
                    }
                ],
                representativeIndexes: [ 0 ]
            },
            userRepresentativeRatings: [ rating ]
        })

        expect(results).toEqual(new Int8Array([ fitnessValues[0] + rating, fitnessValues[1] + Math.round(rating / 4) ]))
    })

    const testCases: {
        fitnessValues: number[],
        clusterResult: ClusterResult,
        userRepresentativeRatings: (number | undefined)[],
        expected: number[]
    }[] = [
        {
            fitnessValues: [ 10, -10, 0 ],
            clusterResult: {
                assignments: [
                    {
                        clusterIndex: 1,
                        distanceToCentroid: 2
                    },
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 4
                    },
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 8
                    }
                ],
                representativeIndexes: [ 1, 0 ]
            },
            userRepresentativeRatings: [ 10, -5 ],
            expected: [ 5, 0, 5 ]
        },
        {
            fitnessValues: [ 0, 0, 0 ],
            clusterResult: {
                assignments: [
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 2
                    },
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 4
                    },
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 8
                    }
                ],
                representativeIndexes: [ 0, undefined ] as number[]
            },
            userRepresentativeRatings: [ -10, undefined ],
            expected: [ -10, -5, -2 ]
        },
        {
            fitnessValues: [ 0, 0, 0 ],
            clusterResult: {
                assignments: [
                    {
                        clusterIndex: 2,
                        distanceToCentroid: 2
                    },
                    {
                        clusterIndex: 1,
                        distanceToCentroid: 4
                    },
                    {
                        clusterIndex: 0,
                        distanceToCentroid: 8
                    }
                ],
                representativeIndexes: [ 2, 1, 0 ]
            },
            userRepresentativeRatings: [ 10, 20, 30 ],
            expected: [ 30, 20, 10 ]
        }
    ]

    testCases.forEach(({ fitnessValues, clusterResult, userRepresentativeRatings, expected }) => {
        it(`should return ${expected} with fitnessValues ` +
            `${fitnessValues}, clusterResult ${clusterResult} and ratings ${userRepresentativeRatings}`, () => {
                const results = updater.update({
                    fitnessValues: new Int8Array(fitnessValues),
                    clusterResult,
                    userRepresentativeRatings
                })

                expect(results).toEqual(new Int8Array(expected))
        })
    })
})
