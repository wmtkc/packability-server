import { gql } from 'apollo-server';
import { User } from '@src/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Schema } from 'mongoose';
import { Bag } from '@src/models/Bag';

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
        token: String!
        expiresIn: Int! # minutes
    }

    type _usersMeta {
        count: Int!
    }

    type Query {
        users(skip: Int, first: Int): [User!]
        isUsernameAvailable(username: String!): Boolean!
        getUserBags(user: ID!): [Bag!]
        _usersMeta: _usersMeta
    }

    type Mutation {
        createUser(username: String!, email: String!, password: String!): User!
        login(usernameOrEmail: String!, password: String!): AuthData!
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
        isUsernameAvailable: async (_: any, args: { username: string }) => {
            // TODO: check cache first
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

            // TODO: cache username for isUsernameAvailable query to avoid unneccesary DB accesses

            try {
                await user.save();
                return user;
            } catch (err) {
                throw err;
            }
        },
        login: async (_: any, args: { usernameOrEmail: string, password: string }) => {

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

            const res = await bcrypt.compare(args.password, user.passwordHash);

            if (!res) throw new Error('Invalid Credentials');
            
            const token = jwt.sign({userId: user.id, email: user.email}, 'SECRET', {
                expiresIn: '120m'
            });

            return {
                userId: user.id,
                token: token,
                expiresIn: 120
            };
        },
    }
};