import { Bag } from '@models/Bag'
import { Kit } from '@models/Kit'
import { gql } from 'apollo-server-express'
import mongoose from 'mongoose'

import {
    getStaticTestUser,
    invalidUser,
    useGlobalTestWrap,
} from '@lib/testHelpers'

const testServer = useGlobalTestWrap()

describe('create bag mutation', () => {
    const CREATE_BAG_MUTATION = gql`
        mutation CreateBag($name: String!, $owner: String!) {
            createBag(name: $name, owner: $owner) {
                id
                name
                kits {
                    kitId
                    isDefault
                }
            }
        }
    `
    const testName = 'test bag'

    it('correct variables', async () => {
        const staticTestUserId = await getStaticTestUser()

        const { data, errors } = await testServer.executeOperation({
            query: CREATE_BAG_MUTATION,
            variables: {
                name: testName,
                owner: staticTestUserId,
            },
        })

        expect(errors).not.toBeTruthy()
        expect(data).toBeTruthy()

        if (data) {
            const bag = data.createBag

            expect(mongoose.isValidObjectId(bag.id)).toBeTruthy()
            expect(bag.name).toEqual(testName)
            expect(bag.kits.length).toBe(1)
            expect(mongoose.isValidObjectId(bag.kits[0].kitId)).toBeTruthy()
            expect(bag.kits[0].isDefault).toBe(true)

            // cleanup
            await Bag.deleteOne({ _id: bag.id })
            await Kit.deleteOne({ _id: bag.kits[0].kitId })
        }
    })

    it('invalid owner', async () => {
        const { data, errors } = await testServer.executeOperation({
            query: CREATE_BAG_MUTATION,
            variables: {
                name: testName,
                owner: invalidUser,
            },
        })

        expect(data).not.toBeTruthy()
        expect(errors).toBeTruthy()

        if (errors) {
            expect(errors[0].message).toBe('User not found')
        }
    })

    it.skip('no name', () => {})
})
