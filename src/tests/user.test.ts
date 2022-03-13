import { User } from '@models/User'
import { gql } from 'apollo-server-express'
import mongoose from 'mongoose'

import { UserError } from '@lib/errorMessages'
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
            messageExpected: UserError.emailAlreadyExists,
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
            messageExpected: UserError.usernameAlreadyExists,
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
            messageExpected: UserError.noEmail,
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
            messageExpected: UserError.invalidEmail,
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
            messageExpected: UserError.noUsername,
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
            messageExpected: UserError.usernameLength,
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
            messageExpected: UserError.usernameProfanity,
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
            messageExpected: UserError.usernameInvalidChars,
        })
    })
})

describe('delete user mutation', () => {})

describe('edit user mutation', () => {})
