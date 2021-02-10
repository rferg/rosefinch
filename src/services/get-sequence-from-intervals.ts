import { GeneUtil } from '../common/gene-util'
import { Pitch } from '../common/pitch'
import { Uint8 } from '../common/uint8'

export function getSequenceFromIntervals(start: Pitch, intervals: number[], ignoreOctave = false): Pitch[] {
    if (start === Pitch.Rest || start === Pitch.Hold) { return [] }
    if (!intervals) { return [] }

    let current = start
    const result = [ current ]
    for (let intervalIndex = 0; intervalIndex < intervals.length; intervalIndex++) {
        const interval = intervals[intervalIndex]
        let next = current + interval
        if (ignoreOctave) {
            if (next >= Pitch.Hold) {
                // Add 2 to account for Rest and Hold and then get pitch by mod.
                next = GeneUtil.getPitch(next + 2 as Uint8)
            }
        } else {
            const currentPitch = GeneUtil.getPitch(current)
            const nextPitch = GeneUtil.getPitch(next as Uint8)
            if (nextPitch === Pitch.Hold || currentPitch > nextPitch) {
                next += 2
            }
        }
        result.push(next)
        current = next
    }
    return result
}
