import { Injectable } from 'cewdi'
import { PlayableNote } from '../playable-note'

@Injectable()
export class NotationRenderer {
    render({
        elementId,
        sequence,
        timeSignature,
        shortestNoteDuration
    }: {
        elementId: string,
        sequence: PlayableNote[],
        timeSignature: [number, 1 | 2 | 4 | 8 | 16 ],
        shortestNoteDuration: 1 | 2 | 4 | 8 | 16
    }) {
        throw new Error('not implemented' + elementId + sequence + timeSignature + shortestNoteDuration)
    }
}
