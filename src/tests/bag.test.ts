import { Bag } from '@models/Bag'
import { Kit } from '@models/Kit'
import { gql } from 'apollo-server-express'
import mongoose from 'mongoose'

import { BagError, UserError } from '@lib/errorMessages'
import {
    expectErrorTest,
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
        await expectErrorTest({
            server: testServer,
            query: CREATE_BAG_MUTATION,
            vars: {
                name: testName,
                owner: invalidUser,
            },
            messageExpected: UserError.notFound,
        })
    })

    it.skip('no name', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_BAG_MUTATION,
            vars: {
                name: '',
                owner: invalidUser,
            },
            messageExpected: BagError.noName,
        })
    })
})

describe('delete bag mutation', () => {})

describe('edit bag mutation', () => {})

describe('add bag kit mutation', () => {
    const ADD_BAG_KIT_MUTATION = gql`
        mutation AddBagKit($bag: ID!, $kit: ID!) {
            addBagKit(bag: $bag, kit: $kit) {
                id
                kits {
                    kitId
                    isDefault
                }
            }
        }
    `
})

describe('remove bag kit mutation', () => {})

describe('edit bag kit mutation', () => {})
