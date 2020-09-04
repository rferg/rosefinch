import { FieldValidator } from './field-validator'

export function requiredFieldValidatorFactory(fieldName: string): FieldValidator {
    return value => {
        const isValid = value !== undefined
        return { isValid, errors: isValid ? undefined : [ `${fieldName} is required.` ] }
    }
}
