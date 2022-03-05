import { gql } from 'apollo-server-express';
import { User } from '@src/models/User';
import bcrypt from 'bcrypt';
import { Schema } from 'mongoose';
import { Bag } from '@src/models/Bag';
import { Context } from '@src/lib/types/Context';
import { createAccessToken, setRefreshTokenCookie } from '@src/lib/auth';

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
        createdAt: Date
        updatedAt: Date
    }

    type AuthData {
        userId: ID!
        accessToken: String!
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
        logout(logout: Boolean): String!
    }
`

const now = new Date();

// Define your resolvers
export const resolvers = {
    Query: {
        users: async (_: any, args: { skip?: number, first?: number }) => {
            return await User.find()
                .skip(args.skip ?? 0)
                .limit(args.first ?? 0)
        },
        me: async (_: any, args: {}, context: Context) => {
            if (!context.isAuth) return null;

            if (!context.payload) return null;

            const user = await User.findById(context.payload.userId)

            if (!user) return null;
            
            return user;
        },
        isUsernameAvailable: async (_: any, args: { username: string }) => {
            const user = await User.findOne({ username: args.username });
            return !Boolean(user);
        },
        getUserBags: async (_: any, args: { user: Schema.Types.ObjectId }) => {
            const user = await User.findById( args.user );
            if (!user) throw new Error('User not found');
            if (!user.bags.length) throw new Error('Bag has no items');

            const bagsFound = await Bag.find({id: { $in: user.bags }});
            if (!bagsFound) throw new Error('Bag items not found in database -- How did this happen?');

            return bagsFound;
        },
        _usersMeta: async () => {
            return {
                count: await User.count((err) => console.log(err))
            }
        }
    },

    Mutation: {
        createUser: async (_: any, args: { username: string, email: string, password: string } ) => {

            let existingUser = await User.findOne({ email: args.email });
            if (existingUser) {
                throw new Error('User with email already exists.');
            }

            existingUser = await User.findOne({ username: args.username });
            if (existingUser) {
                throw new Error('Username already taken');
            }

            const passwordHash = await bcrypt.hash(args.password, 10);
            const user = new User({ username: args.username, email: args.email, passwordHash: passwordHash, createdAt: now, updatedAt: now });

            try {
                await user.save();
                return user;
            } catch (err) {
                throw err;
            }
        },
        login: async (_: any, args: { usernameOrEmail: string, password: string }, context: Context) => {

            console.log("IN LOGIN MUTATION")
            console.dir(context);
            console.log("IN LOGIN MUTATION")

            if (!args.usernameOrEmail) throw new Error('Provide Username or Email');  
            if (!args.usernameOrEmail) throw new Error('Password Required');  

            let user;

            // If usernameOrEmail matches email regex
            if (args.usernameOrEmail
                    .toLowerCase()
                    .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                ) {
                user = await User.findOne({ email: args.usernameOrEmail });
            } else {
                user = await User.findOne({ username: args.usernameOrEmail });
            } 

            if (!user) throw new Error('User does not exist');

            const match = await bcrypt.compare(args.password, user.passwordHash);

            if (!match) throw new Error('Invalid Credentials');

            setRefreshTokenCookie(context.res, user);
            
            return {
                userId: user.id,
                accessToken: createAccessToken(user),
            };
        },
        logout: async (_: any, args: { logout: boolean }, context: Context) => {
            console.dir(context);

            if (!context.isAuth) throw new Error('Not authenticated')

            if (!context.payload) throw new Error('No token payload')

            const user = await User.findById(context.payload.userId)

            if (!user) throw new Error("User not found");

            // Should this be here or only on "reset password", account hacked, etc
            // revokeRefreshTokensForUser(user);

            // TODO: More logout actions
        }
    }
};