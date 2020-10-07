import { Injectable } from 'cewdi'
import { Part, start, Time, TimeClass, ToneEventCallback, Transport } from 'tone'

type Seconds = number
type Subdivision = '1m' | '1n' | '1n.' | '2n' | '2n.' | '2t' | '4n' | '4n.'
    | '4t' | '8n' | '8n.' | '8t' | '16n' | '16n.' | '16t' | '32n' | '32n.'
    | '32t' | '64n' | '64n.' | '64t' | '128n' | '128n.' | '128t' | '256n' | '256n.' | '256t' | '0'
type TimeObject = {
    [sub in Subdivision]?: number
}
type TimeType = string | Seconds | TimeObject | Subdivision

type CallbackType<T> = T extends {
    time: TimeType;
    [key: string]: any;
} ? T : T extends ArrayLike<any> ? T[1] : T extends TimeType ? null : never

@Injectable()
export class ToneWrapper {

    get transport() { return Transport }

    start(): Promise<void> {
        return start()
    }

    getTime(value: string): TimeClass {
        return Time(value)
    }

    getPart<T extends {
        time: TimeType;
        [key: string]: any;
    }>(callback: ToneEventCallback<CallbackType<T>>, values: T[]): Part<T> {
        return new Part<T>(callback, values)
    }
}
