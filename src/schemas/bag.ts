import { gql } from 'apollo-server';
import { Schema } from 'mongoose';

import { Bag } from '@src/models/Bag';
import { User } from '@src/models/User';
import { Item } from '@src/models/Item';

// Define your types
export const typeDef = gql`
    scalar Date

    type BagItem {
        id: ID!
        itemId: ID!
        qty: Int!
    }

    type Bag {
        id: ID!
        name: String!
        owner: ID!
        items: [BagItem!]
        createdAt: Date
        updatedAt: Date
    }

    type _bagsMeta {
        count: Int!
    }

    type Query {
        bags(skip: Int, first: Int): [Bag!]
        getBagItems( bag: ID! ): [Item!]
        _bagsMeta: _bagsMeta
    }

    type Mutation {
        createBag(name: String!, owner: String!): Bag!
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
        getBagItems: async (_: any, args: { bag: Schema.Types.ObjectId }) => {
            const bag = await Bag.findById( args.bag );
            if (!bag) throw new Error('Bag not found');
            if (!bag.items.length) throw new Error('Bag has no items');

            const itemsFound = await Item.find({id: { $in: bag.items }});
            if (!itemsFound) throw new Error('Bag items not found in database -- How did this happen?');

            return itemsFound;
        },
        _bagsMeta: async () => {
            return {
                count: await Bag.count((err) => console.log(err))
            }
        }
    },

    Mutation: {
        createBag: async (_: any, args: { name: string, owner: Schema.Types.ObjectId } ) => {
            const user = await User.findById( args.owner );
            if (!user) throw new Error('User not found');

            const bag = new Bag({ name: args.name, owner: args.owner, createdAt: now, updatedAt: now });
            user.bags.push(bag.id);
            try {
                let result = await bag.save();
                await user.save();
                return result;
            } catch (err) {
                throw err;
            }
        },
        addBagItem: async (_: any, args: { bag: Schema.Types.ObjectId, item: Schema.Types.ObjectId, qty?: number } ) => {
            // TODO: can we use Promise.allSettled() here d/s typescript? would prefer to run these requests in parallel
            const bag = await Bag.findById( args.bag );
            if (!bag) throw new Error('Bag not found');

            const item = await Item.findById( args.item );
            if (!item) throw new Error('Item not found');

            let pushNewItem = true;
            bag.items.forEach((item, index, arr) => {
                if (item.itemId == args.item) {
                    arr[index].qty += args.qty ?? 1;
                    pushNewItem = false;
                }
            });

            if (pushNewItem) {
                bag.items.push({ 
                    itemId: args.item, 
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