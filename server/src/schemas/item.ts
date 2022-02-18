import { gql } from 'apollo-server';
import { Item } from '@src/models/Item';

// Define your types
export const typeDef = gql`
    type Item {
        id: ID!
        name: String!
        url: String!
    }

    type _itemsMeta {
        count: Int!
    }

    type Query {
        items(skip: Int, first: Int): [Item]!
        _itemsMeta: _itemsMeta
    }

    type Mutation {
        createItem(name: String! url: String!): Item!
    }
`

// Define your resolvers
export const resolvers = {
    Query: {
        items: async (_: any, args: any) => {
            console.dir(args);
            return await Item.find()
                             .skip(args.skip)
                             .limit(args.first)
        },
        _itemsMeta: async () => {
            return {
                count: await Item.count((err) => console.log(err))
            }
        }
    },

    Mutation: {
        createItem: async (_: any, args: any ) => {
            const item  = new Item({ name: args.name, url: args.url });
            try {
                let result = await item.save();
                return result;
            } catch (err) {
                throw err;
            }
        }
    }
};