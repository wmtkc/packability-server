import { User } from '@models/User'
import { gql } from 'apollo-server-express'
import mongoose from 'mongoose'

import {
    expectErrorTest,
    staticTestUser,
    useGlobalTestWrap,
} from '@lib/testHelpers'

const testServer = useGlobalTestWrap()

describe('create user mutation', () => {
    const CREATE_USER_MUTATION = gql`
        mutation CreateUser(
            $username: String!
            $email: String!
            $password: String!
        ) {
            createUser(
                username: $username
                email: $email
                password: $password
            ) {
                id
            }
        }
    `
    const correctVars = {
        username: 'testuser',
        email: 'test@packability.io',
        password: 'testpass',
    }

    it('correct variables', async () => {
        const { data, errors } = await testServer.executeOperation({
            query: CREATE_USER_MUTATION,
            variables: correctVars,
        })

        expect(errors).not.toBeTruthy()
        expect(data).toBeTruthy()

        if (data) {
            expect(mongoose.isValidObjectId(data.createUser.id)).toBeTruthy()

            // cleanup
            await User.deleteOne({ email: correctVars.email })
        }
    })

    it('already used email', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_USER_MUTATION,
            vars: {
                ...correctVars,
                email: staticTestUser.email,
            },
            messageExpected: 'User with email already exists',
        })
    })

    it('username taken', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_USER_MUTATION,
            vars: {
                ...correctVars,
                username: staticTestUser.username,
            },
            messageExpected: 'Username already taken',
        })
    })

    it('no email', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_USER_MUTATION,
            vars: {
                ...correctVars,
                email: '',
            },
            messageExpected: 'Email required',
        })
    })

    it('bad email', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_USER_MUTATION,
            vars: {
                ...correctVars,
                email: 'bademail',
            },
            messageExpected: 'Email must be valid',
        })
    })

    it('no username', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_USER_MUTATION,
            vars: {
                ...correctVars,
                username: '',
            },
            messageExpected: 'Username required',
        })
    })

    it.skip('username not long enough', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_USER_MUTATION,
            vars: {
                ...correctVars,
                username: 'a',
            },
            messageExpected: 'Username must contain at least 4 characters',
        })
    })

    it.skip('username contains profanity', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_USER_MUTATION,
            vars: {
                ...correctVars,
                username: 'puta',
            },
            messageExpected: 'Username must not contain profanity',
        })
    })

    it.skip('username contains invalid chars', async () => {
        await expectErrorTest({
            server: testServer,
            query: CREATE_USER_MUTATION,
            vars: {
                ...correctVars,
                username: '',
            },
            messageExpected:
                'Username must contain only numbers or latin letters',
        })
    })
})

describe('delete user mutation', () => {})

describe('edit user mutation', () => {})
