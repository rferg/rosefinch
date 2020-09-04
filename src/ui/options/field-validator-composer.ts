import { FieldValidator } from './field-validator'

export function fieldValidatorComposer(validators: FieldValidator[]): FieldValidator {
    return (value?: string | number) => {
        return validators.reduce((acc, validator) => {
            const { isValid, errors } = validator(value)
            acc.errors.push(...(errors || []))
            if (acc.isValid) { acc.isValid = isValid }
            return acc
        }, { isValid: true as boolean, errors: [] as string[] })
    }
}
