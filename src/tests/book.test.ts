import schema from '@schemas/_schema'
import { ApolloServer, gql } from 'apollo-server-express'
import mongoose from 'mongoose'

const testServer = new ApolloServer({ schema })

describe('resolvers', () => {
    const newBook = { title: 'The DaVinci Code', author: 'Dan Brown' }

    it('createBook mutation', async () => {
        const createBook = `
            mutation CreateBook($title: String!, $author: String!) {
                createBook(title: $title, author: $author)
                    id
                    title
                    author
            }
        `

        const res = await testServer.executeOperation({
            query: createBook,
            variables: newBook,
        })

        expect(res.data).toEqual({
            createBook: {
                id: expect.stringMatching('[a-z0-9]*'),
                title: newBook.title,
                author: newBook.author,
            },
        })
    })

    it('getBooks query', async () => {
        const getBooks = `
            query GetBooks{
                getBooks {
                    id
                    title
                    author
                }
            }
        `

        const getBooksResponse = await testServer.executeOperation({
            query: getBooks,
        })

        expect(getBooksResponse).toHaveProperty('data.getBooks')
    })
})
