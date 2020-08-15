import { KMeans } from '../../src/clustering/k-means'

describe('KMeans', () => {
    let centroidInitSpy: jasmine.Spy<(k: number, d: number) => number[][]>
    let distanceMetricSpy: jasmine.Spy<(x: number[], y: number[]) => number>
    let progressSpy: jasmine.Spy<(iteration: number) => void>
    let kmeans: KMeans

    beforeEach(() => {
        centroidInitSpy = jasmine.createSpy<(k: number, d: number) => number[][]>(
            'centroidInitializer',
            (k: number, d: number) => {
                const centroids = new Array(k)
                for (let i = 0; i < centroids.length; i++) {
                    centroids[i] = new Array(d)
                    for (let j = 0; j < d; j++) {
                        centroids[i][j] = Math.random()
                    }
                }
                return centroids
            }
        ).and.callThrough()
        distanceMetricSpy = jasmine.createSpy<(x: number[], y: number[]) => number>(
            'distanceMetric',
            (x: number[], y: number[]) =>
                x.reduce((agg, xi, i) => agg + Math.abs(xi - y[i]), 0)
        ).and.callThrough()
        progressSpy = jasmine.createSpy<(iteration: number) => void>('progressTracker')
        kmeans = new KMeans(centroidInitSpy, distanceMetricSpy)
    })

    describe('cluster', () => {
      it('should throw if no data', () => {
          expect(() => kmeans.cluster([], 3, 0)).toThrowError(/no data points/i)
      })

      it('should throw if numberOfCentroids <= 0', () => {
          expect(() => kmeans.cluster([ [ 0, 1 ] ], -1, 0)).toThrowError(/must be a positive integer/i)
      })

      it('should throw if stoppingThreshold < 0', () => {
        expect(() => kmeans.cluster([ [ 0, 1 ] ], 3, -1)).toThrowError(/must be >= 0/i)
    })

      it('should not run more than maxIterations', () => {
          const maxIterations = 1
          const data = [
              [ 0, 1 ],
              [ 1, 1 ],
              [ 0.5, 0.5 ],
              [ 0, 0 ],
              [ 1, 0 ]
          ]
          kmeans.cluster(data, 2, 0, { progressTracker: progressSpy, maxIterations })

          expect(progressSpy).toHaveBeenCalledTimes(maxIterations)
          expect(progressSpy).toHaveBeenCalledWith(maxIterations)
      })

      it('should return assignments for each data point', () => {
        const data = [
            [ 0, 1 ],
            [ 1, 1 ],
            [ 0.5, 0.5 ],
            [ 0, 0 ],
            [ 1, 0 ]
        ]
        const { assignments } = kmeans.cluster(data, 2, 0.1)

        expect(assignments.length).toBe(data.length)
        assignments.forEach(assignment => expect(assignment).toBeDefined())
      })

      it('should return representatives that have smallest distance to assigned cluster centroid', () => {
        const data = [
            [ 0, 1 ],
            [ 1, 1 ],
            [ 0.5, 0.5 ],
            [ 0, 0 ],
            [ 1, 0 ]
        ]
        const k = 2
        const { assignments, representativeIndexes } = kmeans.cluster(data, k, 0.01, { maxIterations: 10 })

        expect(representativeIndexes.length).toBe(k)
        representativeIndexes.forEach(repIdx => {
            const { clusterIndex, distanceToCentroid } = assignments[repIdx]
            assignments
                .filter((assignment, i) => assignment.clusterIndex === clusterIndex && i !== repIdx)
                .forEach(({ distanceToCentroid: otherDistance }) =>
                    expect(otherDistance).toBeGreaterThanOrEqual(distanceToCentroid))
        })
      })

      const testCases: {
            data: number[][],
            k: number,
            centroids: number[][],
            expectedAssignments: number[]
        }[] = [
        {
            data: [
                [ 0, 0 ],
                [ 1, 1 ]
            ],
            k: 2,
            centroids: [
                [ 0.1, 0.1 ],
                [ 0.9, 0.9 ]
            ],
            expectedAssignments: [ 0, 1 ]
        },
        {
            data: [
                [ 0.1, 0.1 ],
                [ 1.8, 1.9 ],
                [ 0.5, 0.2 ],
                [ 2.3, 2.6 ],
                [ 0.2, 0.5 ],
                [ 1.2, 1.5 ],
                [ 0.9, 1.1 ],
                [ 2.1, 2 ],
                [ 0.8, 1.3 ]
            ],
            k: 3,
            centroids: [
                [ 0.1, 0.1 ],
                [ 0.9, 1.3 ],
                [ 1.8, 2.1 ]
            ],
            expectedAssignments: [ 0, 2, 0, 2, 0, 1, 1, 2, 1 ]
        },
        {
            data: [
                [ 0, 0 ],
                [ 1, 1 ],
                [ 2, 2 ]
            ],
            k: 1,
            centroids: [
                [ 0.1, 0.1 ]
            ],
            expectedAssignments: [ 0, 0, 0 ]
        },
        {
            data: [
                [ 0, 1 ],
                [ 1, 0 ],
                [ 0.9, 0.1 ],
                [ 0.1, 0.9 ],
                [ 0.8, 0.2 ],
                [ 0.2, 0.8 ],
                [ 0.3, 0.7 ],
                [ 0.7, 0.3 ],
                [ 0.4, 0.6 ],
                [ 0.6, 0.4 ]
            ],
            k: 2,
            centroids: [
                [ 0.8, 0.2 ],
                [ 0.2, 0.8 ]
            ],
            expectedAssignments: [
                1,
                0,
                0,
                1,
                0,
                1,
                1,
                0,
                1,
                0
            ]
        }
      ]

      testCases.forEach(({ data, k, centroids, expectedAssignments }) => {
        it(`should assign as expected with data ${data} and k ${k}`, () => {
            centroidInitSpy.and.returnValue(centroids)
            const assignments = kmeans.cluster(data, k, 0.01, { maxIterations: 50 })
                .assignments.map(({ clusterIndex }) => clusterIndex)
            expect(assignments).toEqual(expectedAssignments)
        })
      })
    })
})
