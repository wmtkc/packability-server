import { Item, ItemType } from '@models/Item'
import { gql } from 'apollo-server-express'

// Define your types
export const typeDef = gql`
    enum ItemType {
        PRODUCT
        NON_PRODUCT
        GENERIC
    }

    type Item {
        id: ID!
        type: ItemType!
        name: String!
        extUrl: String
    }

    type _itemsMeta {
        count: Int!
    }

    # TODO: _itemTypes - returns all ItemTypes for dynamic handling by client
    type Query {
        items(skip: Int, first: Int): [Item!]
        _itemsMeta: _itemsMeta
    }

    # TODO: editItem
    type Mutation {
        createItem(name: String!, type: ItemType!, extUrl: String): Item!
    }
`

// Define your resolvers
export const resolvers = {
    Query: {
        items: async (_: any, args: { skip?: number; first?: number }) => {
            return await Item.find()
                .skip(args.skip ?? 0)
                .limit(args.first ?? 0)
        },
        _itemsMeta: async () => {
            return {
                count: await Item.count(err => console.log(err)),
            }
        },
    },

    Mutation: {
        createItem: async (
            _: any,
            args: { name: string; type: ItemType; extUrl?: string },
        ) => {
            const item = new Item({
                name: args.name,
                type: args.type,
                extUrl: args.extUrl,
            })
            try {
                await item.save()
                return item
            } catch (err) {
                throw err
            }
        },
    },
}
