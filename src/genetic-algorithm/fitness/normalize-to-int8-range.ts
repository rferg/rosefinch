import { Int8 } from '../../common/int8'

export function normalizeToInt8Range(rawValues: Int8Array | Int16Array): Int8Array {
    const normalized = new Int8Array(rawValues.length)
    const max = Math.max(...rawValues)
    const min = Math.min(...rawValues)
    if (max === min) {
        // If this is the case, then all values are the same,
        // so return 0, as it's middle of range.  (Avoids possible division by 0)
        return normalized
    }
    const targetMax: Int8 = 127
    const targetMin: Int8 = -128
    const rangeRatio = (targetMax - targetMin) / (max - min)
    const adjustment = targetMax - rangeRatio * max
    for (let index = 0; index < rawValues.length; index++) {
        normalized[index] = Math.round(rangeRatio * rawValues[index] + adjustment)
    }
    return normalized
}
