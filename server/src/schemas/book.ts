import { gql } from 'apollo-server';
import { Book } from '@src/models/Book';

// Define your types
export const typeDef = gql`
    type Book {
        id: ID!
        title: String!
        author: String!
    }

    type _booksMeta {
        count: Int!
    }

    type Query {
        books(skip: Int, first: Int): [Book]!
        _booksMeta: _booksMeta
    }

    type Mutation {
        createBook(title: String!, author: String!): Book!
    }
`

// Define your resolvers
export const resolvers = {
    Query: {
        books: async (_: any, args: { skip?: number, first?: number }) => {
            return await Book.find()
                             .skip(args.skip ?? 0)
                             .limit(args.first ?? 0)
        },
        _booksMeta: async () => {
            return {
                count: await Book.count()
            }
        }
    },

    Mutation: {
        createBook: async (_: any, args: { title: string, author: string } ) => {
            const book = new Book({ title: args.title, author: args.author });
            try {
                await book.save();
                return book;
            } catch (err) {
                throw err;
            }
        }
    }
};