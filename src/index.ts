import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from "mongoose";

import schema from "@src/schemas/_schema";

import logger from "@src/lib/logger";
import sandbox from "@src/lib/sandbox";
import { setContext } from "@src/lib/context";
import { validateRefresh } from "@src/lib/auth";

const startServer = async () => {
  const app = express();
  app.use(cookieParser());

  app.use(cors({
    origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
    credentials: true
  }));

  app.post('/refresh_token', validateRefresh);

  // Connect to the database
  await mongoose.connect("mongodb://localhost:27017/packability");
  //mongoose.set('debug', true);

  // Start GraphQL Server
  const httpServer = http.createServer(app);
  const server = new ApolloServer({ 
    schema, 
    context: setContext,
    plugins: [
      //logger, 
      ApolloServerPluginDrainHttpServer({ httpServer })
    ]
  });
  
  await server.start();
  server.applyMiddleware({ app, cors: false });

  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀  Server ready at http://localhost:4000${server.graphqlPath}`);
  sandbox();
};

startServer();
