import { Kit, KitName, KitType } from '@models/Kit'
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

        if (!data) return
        expect(mongoose.isValidObjectId(data.createUser.id)).toBeTruthy()

        const user = await User.findById(data.createUser.id)
        expect(user).toBeTruthy()

        if (!user) return
        expect(user.username).toEqual(correctVars.username)
        expect(user.email).toEqual(correctVars.email)
        expect(user.name).toBeUndefined()
        expect(user.kits.length).toEqual(0)
        expect(mongoose.isValidObjectId(user.wishlistKit)).toBeTruthy()
        expect(mongoose.isValidObjectId(user.defaultKit)).toBeTruthy()

        const defaultKit = await Kit.findById(user.defaultKit)
        expect(defaultKit).toBeTruthy()

        if (!defaultKit) return
        expect(defaultKit.type).toEqual(KitType.Default)
        expect(defaultKit.name).toEqual(KitName.Default)
        expect(defaultKit.owner.toString()).toEqual(user.id)

        const wishlistKit = await Kit.findById(user.wishlistKit)
        expect(wishlistKit).toBeTruthy()

        if (!wishlistKit) return
        expect(wishlistKit.type).toEqual(KitType.Wishlist)
        expect(wishlistKit.name).toEqual(KitName.Wishlist)
        expect(wishlistKit.owner.toString()).toEqual(user.id)

        // cleanup
        await User.findByIdAndDelete(user.id)
        await Kit.findByIdAndDelete(user.wishlistKit)
        await Kit.findByIdAndDelete(user.defaultKit)
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

describe('is username available query', () => {})

describe('get user bags query', () => {})

describe('get user kits query', () => {})
