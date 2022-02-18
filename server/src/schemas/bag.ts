import { gql } from 'apollo-server';
import { Bag } from '@src/models/Bag';
import { Schema } from 'mongoose';

// Define your types
export const typeDef = gql`
    type Item {
        item_id: ID!,
        qty: Int!
    }

    type Bag {
        id: ID!
        name: String!
        items: [Item]!
    }

    type _bagsMeta {
        count: Int!
    }

    type Query {
        bags(skip: Int, first: Int): [Bag]!
        _bagsMeta: _bagsMeta
    }

    type Mutation {
        createBag(name: String!): Bag!
        addBagItem(bag: ID!, item: ID!, qty: Int): Bag!
    }
`

const now = new Date();

// Define your resolvers
export const resolvers = {
    Query: {
        bags: async (_: any, args: { skip?: number, first?: number }) => {
            console.dir(args);
            return await Bag.find()
                .skip(args.skip ?? 0)
                .limit(args.first ?? 0)
        },
        _bagsMeta: async () => {
            return {
                count: await Bag.count((err) => console.log(err))
            }
        }
    },

    Mutation: {
        createBag: async (_: any, args: { name: string } ) => {
            const now = new Date();
            const bag = new Bag({ name: args.name, createdAt: now, updatedAt: now });
            try {
                let result = await bag.save();
                return result;
            } catch (err) {
                throw err;
            }
        },
        addBagItem: async (_: any, args: { bag: Schema.Types.ObjectId, item: Schema.Types.ObjectId, qty?: number } ) => {
            const bag = await Bag.findById( args.bag );
            
            if (!bag) throw Error('Bag not found');

            let pushNewItem = true;
            bag.items.forEach((item, index, arr) => {
                if (item.item_id == args.item) {
                    arr[index].qty += args.qty ?? 1;
                    pushNewItem = false;
                }
            });

            if (pushNewItem) {
                bag.items.push({ 
                    item_id: args.item, 
                    qty: args.qty ?? 1
                });
            }

            bag.updatedAt = now;

            try {
                await bag.save();
                return bag;
            } catch (err) {
                throw err;
            }
        },
    }
};