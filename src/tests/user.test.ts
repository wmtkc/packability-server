import { User } from '@models/User'
import { gql } from 'apollo-server-express'
import mongoose from 'mongoose'

import { staticTestUser, useGlobalTestWrap } from '@lib/testHelpers'

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
        const alreadyUsedEmailVars = {
            ...correctVars,
            email: staticTestUser.email,
        }

        const { data, errors } = await testServer.executeOperation({
            query: CREATE_USER_MUTATION,
            variables: alreadyUsedEmailVars,
        })

        expect(data).not.toBeTruthy()
        expect(errors).toBeTruthy()

        if (errors) {
            expect(errors[0].message).toBe('User with email already exists')
        }
    })

    it('username taken', async () => {
        const sameUsernameVars = {
            ...correctVars,
            username: staticTestUser.username,
        }

        const { data, errors } = await testServer.executeOperation({
            query: CREATE_USER_MUTATION,
            variables: sameUsernameVars,
        })

        expect(data).not.toBeTruthy()
        expect(errors).toBeTruthy()

        if (errors) {
            expect(errors[0].message).toBe('Username already taken')
        }
    })

    it('no email', async () => {
        const noEmailVars = {
            ...correctVars,
            email: '',
        }

        const { data, errors } = await testServer.executeOperation({
            query: CREATE_USER_MUTATION,
            variables: noEmailVars,
        })

        expect(data).not.toBeTruthy()
        expect(errors).toBeTruthy()

        if (errors) {
            expect(errors[0].message).toBe('Email required')
        }
    })

    it('bad email', async () => {
        const badEmailVars = {
            ...correctVars,
            email: 'bademail',
        }

        const { data, errors } = await testServer.executeOperation({
            query: CREATE_USER_MUTATION,
            variables: badEmailVars,
        })

        expect(data).not.toBeTruthy()
        expect(errors).toBeTruthy()

        if (errors) {
            expect(errors[0].message).toBe('Email must be valid')
        }
    })

    it('no username', async () => {
        const noEmailVars = {
            ...correctVars,
            username: '',
        }

        const { data, errors } = await testServer.executeOperation({
            query: CREATE_USER_MUTATION,
            variables: noEmailVars,
        })

        expect(data).not.toBeTruthy()
        expect(errors).toBeTruthy()

        if (errors) {
            expect(errors[0].message).toBe('Username required')
        }
    })
})
