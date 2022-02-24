import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import 'dotenv/config';
import express from 'express';
import http from 'http';
import mongoose from "mongoose";

import { auth } from "@src/lib/auth";
import schema from "@src/schemas/_schema";
import logger from "@src/lib/logger";
import sandbox from "@src/lib/sandbox";

const startServer = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  // Connect to the database
  await mongoose.connect("mongodb://localhost:27017/packability");
  //mongoose.set('debug', true);

  // Start GraphQL Server
  const server = new ApolloServer({ 
    schema, 
    context: auth,
    plugins: [
      logger, 
      ApolloServerPluginDrainHttpServer({ httpServer })
    ] 
  });
  
  await server.start();
  server.applyMiddleware({ app });

  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀  Server ready at http://localhost:4000${server.graphqlPath}`);
  sandbox();
};

startServer();
