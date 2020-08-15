import { manhattanDistance } from '../../src/clustering/manhattan-distance'

describe('manhattanDistance', () => {
    it('should throw if x and y have different lengths', () => {
        expect(() => manhattanDistance([ 1, 2, 3 ], [ 1, 2 ]))
            .toThrowError(/must be of same length/)
    })

    it('should return 0 for empty arrays', () => {
        const result = manhattanDistance([], [])

        expect(result).toBe(0)
    })

    const testCases: { x: number[], y: number[], expected: number }[] = [
        {
            x: [ 1, 2, 3 ],
            y: [ 3, 2, 1 ],
            expected: 4
        },
        {
            x: [ 3, 2, 1 ],
            y: [ 1, 2, 3 ],
            expected: 4
        },
        {
            x: [ -3, -3, -3 ],
            y: [ 3, 3, 3 ],
            expected: 18
        },
        {
            x: [ 0, 0, 0, 0 ],
            y: [ 1, 2, -5, 3 ],
            expected: 11
        },
        {
            x: [ 10, 23, 45, 198 ],
            y: [ -33, 75, 11, 84 ],
            expected: 43 + 52 + 34 + 114
        }
    ]

    testCases.forEach(({ x, y, expected }) => {
        it(`should return ${expected} given ${x} and ${y}`, () => {
            const result = manhattanDistance(x, y)

            expect(result).toBe(expected)
        })
    })
})
