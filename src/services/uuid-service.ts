import { v4 as uuid } from 'uuid'
import { Injectable } from 'cewdi'

@Injectable()
export class UuidService {

    getUuid(): string {
        return uuid()
    }
}
