import { gql } from 'apollo-server';
import { Item } from '@src/models/Item';
import notion from '@notionhq/client';


// Define your types
export const typeDef = gql`
    type BlogPost {
        id: ID!
        name: String!
        extUrl: String
    }

    type _blogpostsMeta {
        count: Int!
    }

    type Query {
        blogposts(skip: Int, first: Int): [BlogPost!]
        _blogpostsMeta: _blogpostsMeta
    }
`

// Define your resolvers
export const resolvers = {
    Query: {
        blogposts: async (_: any, args: { skip?: number, first?: number}) => {
            console.log('hullo');
            return [];
        },
        _postsMeta: async () => {
            return {
                count: await Item.count((err) => console.log(err))
            }
        }
    }
};