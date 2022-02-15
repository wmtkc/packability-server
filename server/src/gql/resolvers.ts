import data from '@src/dummyData';

export const resolvers = {
    Query: {
      books: () => data.books,
    },
};