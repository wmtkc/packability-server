import { gql } from 'apollo-server';
import { Book } from '@src/models/Book';

// Define your types
export const typeDef = gql`
    type Book {
        id: ID
        title: String!
        author: String!
    }

    type Query {
        getBooks: [Book]!
    }

    type Mutation {
        createBook(title: String!, author: String!): Book!
    }
`

// Define your resolvers
export const resolvers = {
    Query: {
        getBooks: async () => Book.find()
    },

    Mutation: {
        createBook: async (_: any, args: any ) => {
            const book = new Book({ title: args.title, author: args.author });
            return book.save();
         }
    }
};