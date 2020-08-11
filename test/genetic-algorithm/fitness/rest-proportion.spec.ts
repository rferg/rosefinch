import { Population } from '../../../src/genetic-algorithm/population'
import { Pitch } from '../../../src/common/pitch'
import { restProportionFactory } from '../../../src/genetic-algorithm/fitness/rest-proportion-factory'
import { Uint8 } from '../../../src/common/uint8'

describe('restProportion', () => {
    it('should return array same length as population', () => {
        const population = new Population({ size: 4, genomeSize: 4 })

        const results = restProportionFactory({ targetProportion: 0 })(population)

        expect(results.length).toBe(population.size)
    })

    it('should set targetProportion to 0 if given negative number', () => {
        const population = new Population({ size: 1, genomeSize: 1, geneFactory: () => Pitch.C })

        const result = restProportionFactory({ targetProportion: -5 })(population)[0]

        expect(result).toBe(0)
    })

    it('should set targetProportion to 1 if given number > 1', () => {
        const population = new Population({ size: 1, genomeSize: 1, geneFactory: () => Pitch.Rest })

        const result = restProportionFactory({ targetProportion: 5 })(population)[0]

        expect(result).toBe(0)
    })

    const testCases: { targetProportion: number, genome: Uint8[], expected: number }[] = [
        {
            targetProportion: 0.5,
            genome: [ Pitch.C, Pitch.B ],
            expected: -50
        },
        {
            targetProportion: 0.5,
            genome: [ Pitch.C, Pitch.Rest ],
            expected: 0
        },
        {
            targetProportion: 0.5,
            genome: [ Pitch.Rest, Pitch.Rest * (Pitch.Hold + 1) as Uint8 ],
            expected: -50
        },
        {
            targetProportion: 0,
            genome: [ Pitch.C, Pitch.B, Pitch.Hold ],
            expected: 0
        },
        {
            targetProportion: 0,
            genome: [ Pitch.C, Pitch.Rest, Pitch.Hold ],
            expected: -33
        },
        {
            targetProportion: 0,
            genome: [ Pitch.Rest, Pitch.Rest, Pitch.Rest ],
            expected: -100
        }
    ]

    testCases.forEach(({ targetProportion, genome, expected }) => {
        it(`should return ${expected} with targetProportion ${targetProportion} and genome ${genome}`, () => {
            const population = new Population({
                size: 1,
                genomeSize: genome.length,
                geneFactory: (i: number) => genome[i]
            })

            const result = restProportionFactory({ targetProportion })(population)[0]

            expect(result).toBe(expected)
        })
    })
})
