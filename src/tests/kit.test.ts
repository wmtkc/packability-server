import { Kit } from '@models/Kit'
import { gql } from 'apollo-server-express'
import mongoose from 'mongoose'

import {
    expectErrorTest,
    getStaticTestUser,
    invalidUser,
    useGlobalTestWrap,
} from '@lib/testHelpers'

const testServer = useGlobalTestWrap()

describe('create kit mutation', () => {
    const CREATE_KIT_MUTATION = gql`
        mutation CreateKit($name: String!, $owner: String!) {
            createKit(name: $name, owner: $owner) {
                id
                type
                name
            }
        }
    `

    const testName = 'test kit'

    it('correct variables', async () => {
        const staticTestUserId = await getStaticTestUser()

        const { data, errors } = await testServer.executeOperation({
            query: CREATE_KIT_MUTATION,
            variables: {
                name: testName,
                owner: staticTestUserId,
            },
        })

        expect(errors).not.toBeTruthy()
        expect(data).toBeTruthy()

        if (data) {
            const kit = data.createKit

            expect(mongoose.isValidObjectId(kit.id)).toBeTruthy()
            expect(kit.name).toEqual(testName)

            // cleanup
            await Kit.deleteOne({ _id: kit.id })
        }
    })

    it('invalid owner', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_KIT_MUTATION,
            vars: {
                name: testName,
                owner: invalidUser,
            },
            messageExpected: 'User not found',
        })
    })

    it.skip('no name', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_KIT_MUTATION,
            vars: {
                name: '',
                owner: invalidUser,
            },
            messageExpected: 'Kit must be named',
        })
    })
})

describe('delete kit mutation', () => {})

describe('edit kit mutation', () => {})

describe('add kit item mutation', () => {
    const ADD_KIT_ITEM_MUTATION = gql`
        mutation AddKitItem($kit: ID!, $item: ID!, $qty: Int) {
            addKitItem(kit: $kit, item: $item, qty: $qty) {
                id
                items {
                    itemId
                    qty
                }
            }
        }
    `
})

describe('remove kit item mutation', () => {})

describe('edit kit item mutation', () => {})
