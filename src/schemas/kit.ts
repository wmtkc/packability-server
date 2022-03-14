import { Item } from '@models/Item'
import { Kit, KitType } from '@models/Kit'
import { User } from '@models/User'
import { gql } from 'apollo-server-express'
import { Schema } from 'mongoose'

import { ItemError, KitError, UserError, debugTags } from '@lib/errorMessages'

// Define your types
export const typeDef = gql`
    scalar Date

    enum KitType {
        DEFAULT
        WISHLIST
        NONE
    }

    type KitItem {
        id: ID!
        itemId: ID!
        qty: Int!
    }

    type Kit {
        id: ID!
        type: KitType!
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
            if (!kit) throw new Error(KitError.notFound)

            if (!kit.items.length) return []

            const itemsFound = await Item.find({ id: { $in: kit.items } })
            if (!itemsFound)
                throw new Error(ItemError.notFound + debugTags.impossible)

            return itemsFound
        },
        _kitsMeta: async () => {
            return {
                count: await Kit.count(err => console.log(err)),
            }
        },
    },

    Mutation: {
        // TODO: optional bag arg
        createKit: async (
            _: any,
            args: { name: string; owner: Schema.Types.ObjectId },
        ) => {
            const user = await User.findById(args.owner)
            if (!user) throw new Error(UserError.notFound)

            const kit = new Kit({
                name: args.name,
                type: KitType.None,
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
            if (!kit) throw new Error(KitError.notFound)

            const item = await Item.findById(args.item)
            if (!item) throw new Error(ItemError.notFound)

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
