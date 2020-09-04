import { fieldValidatorComposer } from '../../../src/ui/options/field-validator-composer'
import { FieldValidator } from '../../../src/ui/options/field-validator'

describe('fieldValidatorComposer', () => {
    it('should return validator that always returns true if given no validators', () => {
        const validator = fieldValidatorComposer([])

        expect(validator(undefined).isValid).toBeTrue()
    })

    it('should return isValid:true if all validators return isValid:true', () => {
        const validators: FieldValidator[] = []
        for (let index = 0; index < 3; index++) {
            const validator = jasmine.createSpy('validator' + index)
            validator.and.returnValue({ isValid: true })
            validators.push(validator)
        }

        const value = ''
        const { isValid } = fieldValidatorComposer(validators)(value)
        expect(isValid).toBeTrue()
        validators.forEach(v => expect(v).toHaveBeenCalledWith(value))
    })

    it('should return isValid:false if at least one validator returns isValid:false', () => {
        const validators: FieldValidator[] = []
        for (let index = 0; index < 3; index++) {
            const validator = jasmine.createSpy('validator' + index)
            validator.and.returnValue({ isValid: !!index })
            validators.push(validator)
        }

        const value = ''
        const { isValid } = fieldValidatorComposer(validators)(value)
        expect(isValid).toBeFalse()
        validators.forEach(v => expect(v).toHaveBeenCalledWith(value))
    })

    it('should collect all errors', () => {
        const validators: FieldValidator[] = []
        for (let index = 0; index < 3; index++) {
            const validator = jasmine.createSpy('validator' + index)
            validator.and.returnValue({ isValid: false, errors: [ `error for ${index}` ] })
            validators.push(validator)
        }
        const expectedErrors = validators.map((_, i) => `error for ${i}`)

        const value = ''
        const { isValid, errors } = fieldValidatorComposer(validators)(value)
        expect(isValid).toBeFalse()
        validators.forEach(v => expect(v).toHaveBeenCalledWith(value))
        expect(errors).toEqual(expectedErrors)
    })
})
