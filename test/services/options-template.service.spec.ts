import { UuidService } from '../../src/common/uuid-service'
import { FitnessMethod, RepeatedSequenceType } from '../../src/genetic-algorithm'
import { OptionsTemplateService } from '../../src/services/options-template.service'
import { OptionsForm, OptionsTemplateRepository, OptionsTemplateStore } from '../../src/storage'

describe('OptionsTemplateService', () => {
    let repoSpy: jasmine.SpyObj<OptionsTemplateRepository>
    let uuidSpy: jasmine.SpyObj<UuidService>
    let service: OptionsTemplateService

    let defaultForm: OptionsForm
    let defaultStore: OptionsTemplateStore
    const defaultUuid = '123456'

    beforeEach(() => {
        defaultForm = {
            size: {
                populationSize: 1000,
                timeSignatureTop: 4,
                timeSignatureBottom: 4,
                octaveMax: 5,
                octaveMin: 4,
                shortestNoteDuration: 8,
                measures: 4
            },
            chords: { weight: 1, method: FitnessMethod.ChordFit, options: { chords: {} } },
            scale: {
                weight: 1,
                method: FitnessMethod.ScaleInterval,
                options: { scale: { pitches: [] }, intervalScores: [] }
            },
            restProportion: { weight: 1, method: FitnessMethod.RestProportion, options: { targetProportion: 0.1 } },
            pitchSequence: {
                weight: 1,
                method: FitnessMethod.PitchSequenceDirection,
                options: {
                    sequenceLength: 3,
                    scores: {
                        'ascending': 2,
                        'descending': 2,
                        'stable': 1
                    }
                }
            },
            rhythmicDispersion: { weight: 1, method: FitnessMethod.RhythmicDispersion, options: { target: 0 } },
            repeatedSequences: {
                weight: 1,
                method: FitnessMethod.RepeatedSequences,
                options: {
                    types: [
                        { type: RepeatedSequenceType.Pitch, minLength: 3 }
                    ]
                }
            }
        }
        const date = new Date(2020, 1, 1)
        defaultStore = {
            ...defaultForm,
            storeName: 'optionsTemplate',
            name: 'name',
            id: 'abc',
            createdOn: date,
            updatedOn: date,
            lastAccessedOn: date
        }
        repoSpy = jasmine.createSpyObj<OptionsTemplateRepository>(
            'OptionsTemplateRepository',
            [ 'add', 'put', 'get', 'getAll' ]
        )
        uuidSpy = jasmine.createSpyObj<UuidService>('UuidService', [ 'getUuid' ])
        service = new OptionsTemplateService(repoSpy, uuidSpy)

        repoSpy.add.and.returnValue(Promise.resolve(''))
        repoSpy.get.and.returnValue(Promise.resolve(defaultStore))
        repoSpy.getAll.and.returnValue(Promise.resolve([]))
        repoSpy.put.and.returnValue(Promise.resolve(''))
        uuidSpy.getUuid.and.returnValue(defaultUuid)
    })

    it('should create', () => {
        expect(service).toBeDefined()
    })

    describe('add', () => {
        it('should return failed if name is falsy', async () => {
            const name = ''

            const result = await service.add(defaultForm, name)

            expect(result.isSuccessful).toBeFalse()
            expect(result.errorMessage).toContain('Name is required')
        })

        it('should add store with uuid, given name, and form values', async () => {
            const name = 'name'
            const form = { ...defaultForm }

            await service.add(form, name)

            const added = repoSpy.add.calls.mostRecent().args[0]
            expect(added.id).toEqual(defaultUuid)
            expect(added.name).toEqual(name)
            expect(added).toEqual(jasmine.objectContaining(form))
        })

        it('should return isSuccessful:false if repo throws', async () => {
            repoSpy.add.and.throwError('error')

            const result = await service.add(defaultForm, 'name')

            expect(result.isSuccessful).toBeFalse()
        })

        it('should return isSuccessful:true if add succeeds', async () => {
            const result = await service.add(defaultForm, 'name')

            expect(result.isSuccessful).toBeTrue()
        })
    })

    describe('put', () => {
        it('should update updatedOn, call repo.put, and return isSuccessful', async () => {
            const originalUpdatedOn = defaultStore.updatedOn
            const result = await service.put(defaultStore)

            expect(repoSpy.put).toHaveBeenCalledWith(defaultStore)
            expect(result.isSuccessful).toBeTrue()
            expect((result.result?.updatedOn ?? new Date(1970, 1, 1)) > originalUpdatedOn).toBeTrue()
        })

        it('should return failed if repo throws', async () => {
            repoSpy.put.and.throwError('error')

            const result = await service.put(defaultStore)

            expect(result.isSuccessful).toBeFalse()
        })
    })

    describe('get', () => {
        it('should call repo.get and return store', async () => {
            const result = await service.get(defaultStore.id)

            expect(result).toEqual(defaultStore)
            expect(repoSpy.get).toHaveBeenCalledWith(defaultStore.id)
        })

        it('should return undefined if repo returns nothing', async () => {
            repoSpy.get.and.returnValue(Promise.resolve(undefined))

            const result = await service.get(defaultStore.id)

            expect(result).toBeUndefined()
        })

        it('should update lastAccessedOn date', async () => {
            const originalStoreAccessedOn = defaultStore.lastAccessedOn

            const result = await service.get(defaultStore.id)

            expect(repoSpy.put).toHaveBeenCalledWith(defaultStore)
            expect((result?.lastAccessedOn ?? new Date(1, 1, 1970)) > originalStoreAccessedOn).toBeTrue()
        })
    })

    describe('getRecent', () => {
        it('should return empty array if no records', async () => {
            // Default is no records.
            const result = await service.getRecent()

            expect(result.length).toBe(0)
        })

        it('should return all records if no take argument given', async () => {
            const records: OptionsTemplateStore[] = [
                { ...defaultStore, id: '0' },
                { ...defaultStore, id: '1' },
                { ...defaultStore, id: '2' }
            ]
            const expected = records.map(({ id, lastAccessedOn, name }) => ({ id, lastAccessedOn, name }))
            repoSpy.getAll.and.returnValue(Promise.resolve(records))

            const result = await service.getRecent()

            expect(result).toEqual(expected)
        })

        it('should return no more than take argument', async () => {
            const records: OptionsTemplateStore[] = [
                { ...defaultStore, id: '0' },
                { ...defaultStore, id: '1' },
                { ...defaultStore, id: '2' }
            ]
            repoSpy.getAll.and.returnValue(Promise.resolve(records))
            const take = 2

            const result = await service.getRecent(take)

            expect(result.length).toBe(take)
        })

        it('should return all records if take is greater than number of records', async () => {
            const records: OptionsTemplateStore[] = [
                { ...defaultStore, id: '0' }
            ]
            repoSpy.getAll.and.returnValue(Promise.resolve(records))
            const take = 2

            const result = await service.getRecent(take)

            expect(result.length).toBe(records.length)
        })

        it('should return records sorted by lastAccessedOn descending', async () => {
            const records: OptionsTemplateStore[] = [
                { ...defaultStore, id: '0', lastAccessedOn: new Date(2021, 1, 1) },
                { ...defaultStore, id: '1', lastAccessedOn: new Date(2021, 2, 1) },
                { ...defaultStore, id: '2', lastAccessedOn: new Date(2021, 3, 1) }
            ]
            const expected = [ ...records ]
                .map(({ id, lastAccessedOn, name }) => ({ id, lastAccessedOn, name }))
                .sort((a, b) => a.lastAccessedOn > b.lastAccessedOn ? -1 : 1)
            repoSpy.getAll.and.returnValue(Promise.resolve(records))

            const result = await service.getRecent()

            expect(result).toEqual(expected)
        })
    })
})
