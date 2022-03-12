import { User } from '@models/User'
import { gql } from 'apollo-server-express'
import mongoose from 'mongoose'

import { useGlobalTestWrap } from '@lib/testHooks'

const alreadyUsed = {
    username: 'staticTestUser',
    email: 'statictestuser@packability.io',
}

const addStaticTestUser = async () => {
    // add static test user to database if not already present
    let user = await User.findOne({ email: alreadyUsed.email })
    if (!user) {
        const now = new Date()
        user = new User({
            username: alreadyUsed.username,
            email: alreadyUsed.email.toLowerCase(),
            passwordHash: 'testpasshash',
            createdAt: now,
            updatedAt: now,
        })
        await user.save()
    }
}

const testServer = useGlobalTestWrap({ beforeAllFn: addStaticTestUser })

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

        expect(data).toBeTruthy()
        expect(errors).not.toBeTruthy()

        if (data) {
            expect(data.createUser).toBeDefined()
            expect(data.createUser.id).toBeDefined()
            expect(mongoose.isValidObjectId(data.createUser.id)).toBeTruthy()
        }

        await User.deleteOne({ email: correctVars.email })
    })

    it('already used email', async () => {
        const alreadyUsedEmailVars = {
            ...correctVars,
            email: alreadyUsed.email,
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
            username: alreadyUsed.username,
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
