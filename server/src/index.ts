import { ApolloServer } from "apollo-server";
import mongoose from "mongoose";

import schema from "@src/schemas/_schema";
import auth from "@src/lib/auth";
import logger from "@src/lib/logger";
import sandbox from "@src/lib/sandbox";

const startServer = async () => {
  // Connect to the database
  await mongoose.connect("mongodb://localhost:27017/packability");
  //mongoose.set('debug', true);

  // Start GraphQL Server
  const server = new ApolloServer({ schema, context: auth, plugins: [logger] });
  server.listen({ port: 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
    sandbox();
  });
};

startServer();
