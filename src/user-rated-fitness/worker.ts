import { FitnessUpdater } from './fitness-updater'
import { normalizeToInt8Range } from '../common/normalize-to-int8-range'
import { messageHandler } from './message-handler'

const updater = new FitnessUpdater(normalizeToInt8Range)

onmessage = (event: MessageEvent) => messageHandler(event, postMessage as (message: any) => void, updater)
