import { requiredFieldValidatorFactory } from '../../../src/ui/options/required-field-validator-factory'

describe('requiredFieldValidatorFactory', () => {
    it('should return validator that returns isValid:true if value is defined', () => {
        const validator = requiredFieldValidatorFactory('test')
        const { isValid } = validator(0)

        expect(isValid).toBeTrue()

        const { isValid: shouldBeTrue } = validator('')
        expect(shouldBeTrue).toBeTrue()
    })

    it('should return validator that returns isValid:false if value is undefined', () => {
        const validator = requiredFieldValidatorFactory('test')
        const { isValid } = validator(undefined)

        expect(isValid).toBeFalse()
    })

    it('should return error message if invalid', () => {
        const fieldName = 'test'
        const { errors } = requiredFieldValidatorFactory(fieldName)(undefined)

        expect(errors?.length).toBe(1)
        expect(errors?.[0]).toMatch(new RegExp(`${fieldName} is required`, 'i'))
    })
})
