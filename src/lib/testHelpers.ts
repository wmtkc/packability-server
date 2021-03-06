import { User } from '@models/User'
import schema from '@schemas/_schema'
import { ApolloServer } from 'apollo-server-express'
import { DocumentNode } from 'graphql'
import mongoose from 'mongoose'

export const staticTestUser = {
    username: 'staticTestUser',
    email: 'statictestuser@packability.io',
}

export const invalidUser = '696969b420e69f1d1b8da69a'

/**
 * Get the id of the static test user
 * @returns string, id of static test user. will be null if used outside tests
 */
export const getStaticTestUser = async () => {
    const user = await User.findOne({ email: staticTestUser.email })
    return user?.id
}

/**
 * Apply global test jobs
 * @returns ApolloServer - test instance
 */
export const useGlobalTestWrap = () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/packability-test')
        let user = await User.findOne({ email: staticTestUser.email })
        if (!user) {
            const now = new Date()
            user = new User({
                username: staticTestUser.username,
                email: staticTestUser.email.toLowerCase(),
                passwordHash: 'testpasshash',
                createdAt: now,
                updatedAt: now,
            })
            await user.save()
        }
    })

    afterAll(async () => {
        await User.deleteOne({ email: staticTestUser.email })
        await mongoose.disconnect()
    })

    beforeEach(() => {})

    afterEach(() => {})

    return new ApolloServer({ schema })
}

export const expectErrorTest = async ({
    server,
    query,
    vars,
    messageExpected,
}: {
    server: ApolloServer
    query: DocumentNode
    vars: any
    messageExpected: string
}) => {
    const { data, errors } = await server.executeOperation({
        query: query,
        variables: vars,
    })

    expect(data).not.toBeTruthy()
    expect(errors).toBeTruthy()

    if (errors) {
        expect(errors[0].message).toEqual(messageExpected)
    }
}
