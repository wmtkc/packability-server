import { Item } from '@models/Item'
import { Kit, KitType } from '@models/Kit'
import { User } from '@models/User'
import { gql } from 'apollo-server-express'
import { Schema } from 'mongoose'

// Define your types
export const typeDef = gql`
    scalar Date

    type KitItem {
        id: ID!
        itemId: ID!
        qty: Int!
    }

    type Kit {
        id: ID!
        type: String!
        name: String!
        owner: ID!
        items: [KitItem!]
        createdAt: Date
        updatedAt: Date
    }

    type _kitsMeta {
        count: Int!
    }

    type Query {
        kits(skip: Int, first: Int): [Kit!]
        getKitItems(kit: ID!): [Item!]
        _kitsMeta: _kitsMeta
    }

    # TODO: removeKitItem
    #       editKitItem
    #       editKit
    type Mutation {
        createKit(name: String!, owner: String!): Kit!
        addKitItem(kit: ID!, item: ID!, qty: Int): Kit!
    }
`

const now = new Date()

// Define your resolvers
export const resolvers = {
    Query: {
        kits: async (_: any, args: { skip?: number; first?: number }) => {
            console.dir(args)
            return await Kit.find()
                .skip(args.skip ?? 0)
                .limit(args.first ?? 0)
        },
        getKitItems: async (_: any, args: { kit: Schema.Types.ObjectId }) => {
            const kit = await Kit.findById(args.kit)
            if (!kit) throw new Error('Kit not found')

            // TODO: this should fail silently and return empty array
            if (!kit.items.length) throw new Error('Kit has no items')

            const itemsFound = await Item.find({ id: { $in: kit.items } })
            if (!itemsFound)
                throw new Error(
                    'Kit items not found in database -- How did this happen?',
                )

            return itemsFound
        },
        _kitsMeta: async () => {
            return {
                count: await Kit.count(err => console.log(err)),
            }
        },
    },

    Mutation: {
        createKit: async (
            _: any,
            args: { name: string; owner: Schema.Types.ObjectId },
        ) => {
            const user = await User.findById(args.owner)
            if (!user) throw new Error('User not found')

            const kit = new Kit({
                name: args.name,
                type: KitType.none,
                owner: args.owner,
                createdAt: now,
                updatedAt: now,
            })
            user.kits.push(kit.id)

            try {
                let result = await kit.save()
                await user.save()
                return result
            } catch (err) {
                throw err
            }
        },
        addKitItem: async (
            _: any,
            args: {
                kit: Schema.Types.ObjectId
                item: Schema.Types.ObjectId
                qty?: number
            },
        ) => {
            // TODO: can we use Promise.allSettled() here d/s typescript? would prefer to run these requests in parallel
            const kit = await Kit.findById(args.kit)
            if (!kit) throw new Error('Kit not found')

            const item = await Item.findById(args.item)
            if (!item) throw new Error('Item not found')

            let pushNewItem = true
            kit.items.forEach((item, index, arr) => {
                if (item.itemId == args.item) {
                    arr[index].qty += args.qty ?? 1
                    pushNewItem = false
                }
            })

            if (pushNewItem) {
                kit.items.push({
                    itemId: args.item,
                    qty: args.qty ?? 1,
                })
            }

            kit.updatedAt = now

            try {
                await kit.save()
                return kit
            } catch (err) {
                throw err
            }
        },
    },
}
