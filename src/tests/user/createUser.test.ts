import { User } from '@models/User'
import schema from '@schemas/_schema'
import { ApolloServer, gql } from 'apollo-server-express'
import mongoose from 'mongoose'

const testServer = new ApolloServer({ schema })

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/packability-test')
})

afterAll(async () => {
    await mongoose.disconnect()
})

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
    })

    it('already used email', async () => {
        const { data, errors } = await testServer.executeOperation({
            query: CREATE_USER_MUTATION,
            variables: correctVars,
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
            email: 'newtest@packability.io',
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

        await User.deleteOne({ email: correctVars.email })
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
