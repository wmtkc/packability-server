import { ApolloServer } from 'apollo-server';
import schema from '@src/schemas/_schema';
import { Bag } from '@src/models/Bag';
import { Item } from '@src/models/Item';

const server = new ApolloServer({schema});

export default async () => {

//     const now = new Date();
//     const bag = new Bag({ name: 'hike', createdAt: now, updatedAt: now }); 
//     const item = new Item({ name: 'apple', url: 'https://example.com/' }); 
//     console.log(bag);

//     bag.items.push(item._id);
//     console.log(bag);
}