import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose';

import schema from '@src/schemas/_schema';

import sandbox from '@src/sandbox';

const startServer = async () => {

    // Connect to the database
    await mongoose.connect('mongodb://localhost:27017/packability');

    // Start GraphQL Server
    const server = new ApolloServer({ schema });
    server.listen({ port: 4000 }).then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
        //sandbox();
    }); 
}

startServer();