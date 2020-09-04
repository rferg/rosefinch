import { numberRangeFieldValidatorFactory } from '../../../src/ui/options/number-range-field-validator-factory'

describe('numberRangeFieldValidatorFactory', () => {
    it('should throw if minValue > maxValue', () => {
        expect(() => numberRangeFieldValidatorFactory(1, 0, ''))
            .toThrowError(/cannot be greater than/i)
    })

    it('should return validator that returns isValid:false if value is a string', () => {
        const fieldName = 'test'
        const { isValid, errors } = numberRangeFieldValidatorFactory(1, 1, fieldName)('')

        expect(isValid).toBeFalse()
        expect(errors?.[0]).toMatch(new RegExp(`${fieldName} should be a number`, 'i'))
    })

    it('should return validator that returns isValid:false if value is undefined', () => {
        const fieldName = 'test'
        const { isValid, errors } = numberRangeFieldValidatorFactory(1, 1, fieldName)(undefined)

        expect(isValid).toBeFalse()
        expect(errors?.[0]).toMatch(new RegExp(`${fieldName} should be a number`, 'i'))
    })

    it('should return validator that returns isValid:false if value is less than min', () => {
        const fieldName = 'test'
        const min = 0
        const { isValid, errors } = numberRangeFieldValidatorFactory(min, 1, fieldName)(-1)

        expect(isValid).toBeFalse()
        expect(errors?.[0]).toMatch(new RegExp(`${fieldName} must be greater than ${min}`, 'i'))
    })

    it('should return validator that returns isValid:false if value is greater than max', () => {
        const fieldName = 'test'
        const max = 1
        const { isValid, errors } = numberRangeFieldValidatorFactory(0, max, fieldName)(2)

        expect(isValid).toBeFalse()
        expect(errors?.[0]).toMatch(new RegExp(`${fieldName} must be less than ${max}`, 'i'))
    })
})
