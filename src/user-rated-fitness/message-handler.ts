import { MessagePoster } from '../common/message-poster'
import { FitnessUpdater } from './fitness-updater'
import { UserRatedFitnessMessage } from './user-rated-fitness-message'
import { UserRatedFitnessResultMessage } from './user-rated-fitness-result-message'

export function messageHandler(
    { data }: MessageEvent,
    postMessage: MessagePoster,
    updater: FitnessUpdater): void {
        validateMessageData(data)

        const messageData = data as UserRatedFitnessMessage

        const fitnessValues = updater.update(messageData)

        postMessage({
            type: 'UserRatedFitnessResultMessage',
            fitnessValues
        } as UserRatedFitnessResultMessage)
}

function validateMessageData(data: any): void {
    if (!isUserRatedFitnessMessage(data)) {
        throw new Error(`Message data ${data} is not a UserRatedFitnessMessage`)
    }
}
function isUserRatedFitnessMessage(data: any): data is UserRatedFitnessMessage {
    return (data as UserRatedFitnessMessage)?.kind === 'UserRatedFitnessMessage'
}
