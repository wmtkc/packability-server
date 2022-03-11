import { Bag } from '@models/Bag'
import { Kit, KitType } from '@models/Kit'
import { User } from '@models/User'
import { gql } from 'apollo-server-express'
import { Schema } from 'mongoose'

// Define your types
export const typeDef = gql`
    scalar Date

    type BagKit {
        id: ID!
        kitId: ID!
        qty: Int!
        isDefault: Boolean!
    }

    type Bag {
        id: ID!
        name: String!
        owner: ID!
        kits: [BagKit!]!
        createdAt: Date
        updatedAt: Date
    }

    type _bagsMeta {
        count: Int!
    }

    type Query {
        bags(skip: Int, first: Int): [Bag!]
        getBagKits(bag: ID!): [Kit!]!
        _bagsMeta: _bagsMeta
    }

    # TODO: removeBagKit
    #       editBagKit
    #       editBag
    type Mutation {
        createBag(name: String!, owner: String!): Bag!
        addBagKit(bag: ID!, kit: ID!, qty: Int): Bag!
    }
`

const now = new Date()

// Define your resolvers
export const resolvers = {
    Query: {
        bags: async (_: any, args: { skip?: number; first?: number }) => {
            console.dir(args)
            return await Bag.find()
                .skip(args.skip ?? 0)
                .limit(args.first ?? 0)
        },
        getBagKits: async (_: any, args: { bag: Schema.Types.ObjectId }) => {
            const bag = await Bag.findById(args.bag)
            if (!bag) throw new Error('Bag not found')
            if (!bag.kits.length)
                throw new Error('Bag has no kits -- How did this happen?')

            const kitsFound = await Kit.find({ id: { $in: bag.kits } })
            if (!kitsFound)
                throw new Error(
                    'Bag kits not found in database -- How did this happen?',
                )

            return kitsFound
        },
        _bagsMeta: async () => {
            return {
                count: await Bag.count(err => console.log(err)),
            }
        },
    },

    Mutation: {
        createBag: async (
            _: any,
            args: { name: string; owner: Schema.Types.ObjectId },
        ) => {
            const user = await User.findById(args.owner)
            if (!user) throw new Error('User not found')

            const bag = new Bag({
                name: args.name,
                owner: args.owner,
                createdAt: now,
                updatedAt: now,
            })
            user.bags.push(bag.id)

            // initialize bag with default kit
            const defaultKit = new Kit({
                name: 'Uncategorized',
                type: KitType.default,
                owner: args.owner,
                bag: bag.id,
                createdAt: now,
                updatedAt: now,
                isDefault: true,
            })
            bag.kits.push({
                kitId: defaultKit.id,
                qty: 1,
                isDefault: true,
            })

            try {
                let result = await bag.save()
                await defaultKit.save()
                await user.save()
                return result
            } catch (err) {
                throw err
            }
        },
        addBagKit: async (
            _: any,
            args: {
                bag: Schema.Types.ObjectId
                kit: Schema.Types.ObjectId
                qty?: number
            },
        ) => {
            // TODO: can we use Promise.allSettled() here d/s typescript? would prefer to run these requests in parallel
            const bag = await Bag.findById(args.bag)
            if (!bag) throw new Error('Bag not found')

            const kit = await Kit.findById(args.kit)
            if (!kit) throw new Error('Kit not found')
            kit.bag = bag.id

            let pushNewKit = true
            bag.kits.forEach((kit, index, arr) => {
                if (kit.kitId == args.kit) {
                    arr[index].qty += args.qty ?? 1
                    pushNewKit = false
                }
            })

            if (pushNewKit) {
                bag.kits.push({
                    kitId: args.kit,
                    qty: args.qty ?? 1,
                    isDefault: false,
                })
            }

            bag.updatedAt = now

            try {
                await bag.save()
                await kit.save()
                return bag
            } catch (err) {
                throw err
            }
        },
    },
}
