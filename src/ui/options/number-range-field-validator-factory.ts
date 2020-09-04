import { FieldValidator } from './field-validator'

export function numberRangeFieldValidatorFactory(min: number, max: number, fieldName: string): FieldValidator {
    if (min > max) {
        throw new Error(`minValue ${min} cannot be greater than maxValue ${max}.`)
    }

    return value => {
        if (typeof value === 'string' || value === undefined) {
            return { isValid: false, errors: [ `${fieldName} should be a number.` ] }
        }

        if (value > max) {
            return { isValid: false, errors: [ `${fieldName} must be less than ${max}` ] }
        } else if (value < min) {
            return { isValid: false, errors: [ `${fieldName} must be greater than ${min}` ] }
        } else {
            return { isValid: true }
        }
    }
}
