import { ApolloServer } from 'apollo-server';
import { typeDefs } from '@src/gql/typeDefs';
import { resolvers } from '@src/gql/resolvers';

const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
}); 