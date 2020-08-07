import { normalizeInt16ToInt8 } from '../../../src/genetic-algorithm/fitness/normalize-int16-to-int8'

describe('normalizeInt16ToInt8', () => {
    it('should return all 0s if values are identical', () => {
        const values = new Int16Array([ 3, 3, 3 ])

        const results = normalizeInt16ToInt8(values)

        expect(results.length).toEqual(values.length)
        for (const result of results) {
            expect(result).toBe(0)
        }
    });

    [ [ 0, 1 ], [ -(2 ** 15), (2 ** 15) - 1 ], [ -100, 100 ] ].forEach(([ min, max ]) => {
        it(`should map to -128 and 127 for min ${min} and max ${max}`, () => {
            const results = normalizeInt16ToInt8(new Int16Array([ min, max ]))

            expect(results[0]).toBe(-128)
            expect(results[1]).toBe(127)
        })
    })

    it('should map middle value to the middle of the range', () => {
        const results = normalizeInt16ToInt8(new Int16Array([ 3, 2, 1 ]))

        expect(results[1]).toBe(0)
    })
})
