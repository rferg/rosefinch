import { randomCentroidsFactory } from '../../src/clustering/random-centroids-factory'

describe('randomCentroidsFactory', () => {
    let randomSpy: jasmine.Spy<() => number>

    beforeEach(() => {
        randomSpy = jasmine.createSpy('randomGenerator', () => 1)
    })

    it('should return function that returns correct number of centroids', () => {
        const numberOfCentroids = 4

        const result = randomCentroidsFactory({ randomGenerator: randomSpy })(numberOfCentroids, 3)

        expect(result.length).toBe(numberOfCentroids)
    })

    it('should return function that returns centroids with correct number of dimensions', () => {
        const numberOfDimensions = 4

        const result = randomCentroidsFactory({ randomGenerator: randomSpy })(3, numberOfDimensions)

        result.forEach(centroid => expect(centroid.length).toBe(numberOfDimensions))
    })

    it('should return empty array if numberOfCentroids is 0', () => {
        const result = randomCentroidsFactory({ randomGenerator: randomSpy })(0, 5)

        expect(result.length).toBe(0)
    })

    it('should return centroids of empty arrays if numberOfDimensions is 0', () => {
        const result = randomCentroidsFactory({ randomGenerator: randomSpy })(3, 0)

        result.forEach(centroid => expect(centroid.length).toBe(0))
    })

    it('should call randomGenerator to fill centroids', () => {
        const expectedValue = 3
        randomSpy.and.returnValue(expectedValue)

        const result = randomCentroidsFactory({ randomGenerator: randomSpy })(3, 3)

        result.forEach(centroid => centroid.forEach(dimension => expect(dimension).toBe(expectedValue)))
    })
})
