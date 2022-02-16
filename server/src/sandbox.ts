import { ApolloServer } from 'apollo-server';
import schema from '@src/schemas/_schema';

const server = new ApolloServer({schema});

export default async () => {

    const getBooks = `
        {
            getBooks {
                id
                title
                author
            }
        }
    `;

    const createBook = `
    mutation Mutation($title: String!, $author: String!) {
        createBook(title: $title, author: $author) {
          id
          title
          author
        }
      }
    `;

    // const res = await server.executeOperation({
    //     query: getBooks
    // });

    const res = await server.executeOperation({
        query: createBook,
        variables: {
            title: 'The DaVinci Code',
            author: 'Dan Brown'
        }
    })

    console.dir(res);
}