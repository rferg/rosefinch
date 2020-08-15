export function randomCentroidsFactory({
    randomGenerator
}: {
    randomGenerator: () => number
}): (numberOfCentroids: number, numberOfDimensions: number) => number[][] {
    return (numberOfCentroids: number, numberOfDimensions: number) =>
        [ ...new Array(numberOfCentroids) ]
            .map(_ => [ ...new Array(numberOfDimensions) ].map(_ => randomGenerator()))
}
