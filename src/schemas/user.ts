import { Bag } from '@models/Bag'
import { Kit, KitName, KitType } from '@models/Kit'
import { User } from '@models/User'
import { gql } from 'apollo-server-express'
import bcrypt from 'bcrypt'
import { Schema } from 'mongoose'

import { createAccessToken, setRefreshTokenCookie } from '@lib/auth'
import { Context } from '@lib/context'
import { BagError, UserError, debugTags } from '@lib/errorMessages'

const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const revokeRefreshTokensForUser = (user: User) => {
    user.tokenVersion++
    user.save()
}

// Define your types
export const typeDef = gql`
    scalar Date

    type User {
        id: ID!
        username: String!
        email: String!
        passwordHash: String
        name: String
        bags: [ID!]
        kits: [ID!]
        createdAt: Date
        updatedAt: Date
    }

    type AuthData {
        accessToken: String!
        user: User!
    }

    type _usersMeta {
        count: Int!
    }

    type Query {
        users(skip: Int, first: Int): [User!]
        me: User
        isUsernameAvailable(username: String!): Boolean!
        getUserBags(user: ID!): [Bag!]
        _usersMeta: _usersMeta
    }

    type Mutation {
        createUser(username: String!, email: String!, password: String!): User!
        login(usernameOrEmail: String!, password: String!): AuthData!
        logout: Boolean!
    }
`

const now = new Date()

// Define your resolvers
export const resolvers = {
    Query: {
        users: async (_: any, args: { skip?: number; first?: number }) => {
            return await User.find()
                .skip(args.skip ?? 0)
                .limit(args.first ?? 0)
        },
        me: async (_: any, args: {}, context: Context) => {
            if (!context.isAuth) return null

            if (!context.payload) return null

            const user = await User.findById(context.payload.userId)

            if (!user) return null

            return user
        },
        isUsernameAvailable: async (_: any, args: { username: string }) => {
            const user = await User.findOne({ username: args.username })
            return !Boolean(user)
        },
        getUserBags: async (_: any, args: { user: Schema.Types.ObjectId }) => {
            const user = await User.findById(args.user)
            if (!user) throw new Error(UserError.notFound)

            if (!user.bags.length) return []

            const bagsFound = await Bag.find({ id: { $in: user.bags } })
            if (!bagsFound)
                throw new Error(BagError.notFound + debugTags.impossible)

            return bagsFound
        },
        _usersMeta: async () => {
            return {
                count: await User.count(err => console.log(err)),
            }
        },
    },

    Mutation: {
        createUser: async (
            _: any,
            args: { username: string; email: string; password: string },
        ) => {
            // TODO: username checking is case-insensitive, but usernames are stored with their case
            if (args.email == '') {
                throw new Error(UserError.noEmail)
            }

            if (args.username == '') {
                throw new Error(UserError.noUsername)
            }

            if (args.password == '') {
                throw new Error(UserError.noPassword)
            }

            if (!args.email.toLowerCase().match(emailRegex)) {
                throw new Error(UserError.invalidEmail)
            }

            let existingUser = await User.findOne({
                email: args.email.toLowerCase(),
            })
            if (existingUser) {
                throw new Error(UserError.emailAlreadyExists)
            }

            existingUser = await User.findOne({ username: args.username })
            if (existingUser) {
                throw new Error(UserError.usernameAlreadyExists)
            }

            const passwordHash = await bcrypt.hash(args.password, 10)
            const user = new User({
                username: args.username,
                email: args.email.toLowerCase(),
                passwordHash: passwordHash,
                createdAt: now,
                updatedAt: now,
            })

            // initialize user with default kit
            const defaultKit = new Kit({
                name: KitName.Default,
                type: KitType.Default,
                owner: user.id,
                createdAt: now,
                updatedAt: now,
            })
            user.defaultKit = defaultKit.id

            // initialize user with wishlist kit
            const wishlistKit = new Kit({
                name: KitName.Wishlist,
                type: KitType.Wishlist,
                owner: user.id,
                createdAt: now,
                updatedAt: now,
            })
            user.wishlistKit = wishlistKit.id

            try {
                await user.save()
                await defaultKit.save()
                await wishlistKit.save()
                return user
            } catch (err) {
                throw err
            }
        },
        login: async (
            _: any,
            args: { usernameOrEmail: string; password: string },
            context: Context,
        ) => {
            if (!args.usernameOrEmail)
                throw new Error(UserError.noUsernameOrEmail)
            if (!args.usernameOrEmail) throw new Error(UserError.noPassword)

            let user

            // If usernameOrEmail matches email regex
            if (args.usernameOrEmail.toLowerCase().match(emailRegex)) {
                user = await User.findOne({
                    email: args.usernameOrEmail.toLowerCase(),
                })
            } else {
                user = await User.findOne({ username: args.usernameOrEmail })
            }

            if (!user) throw new Error(UserError.notFound)

            const match = await bcrypt.compare(args.password, user.passwordHash)

            if (!match) throw new Error(UserError.invalidCredentials)

            setRefreshTokenCookie(context.res, user)

            return {
                accessToken: createAccessToken(user),
                user: user,
            }
        },
        logout: async (_: any, args: {}, context: Context) => {
            setRefreshTokenCookie(context.res)
            return true
        },
    },
}
