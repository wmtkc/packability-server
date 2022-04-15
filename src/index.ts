import schema from '@schemas/_schema'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import http from 'http'
import mongoose from 'mongoose'

import { validateRefresh } from '@lib/auth'
import { setContext } from '@lib/context'
import logger from '@lib/logger'
import sandbox from '@lib/sandbox'

const startServer = async () => {
    const app = express()
    app.use(cookieParser())

    app.use(
        cors({
            origin: [
                'http://localhost:3000',
                'https://studio.apollographql.com',
            ],
            credentials: true,
        }),
    )

    app.post('/refresh_token', validateRefresh)

    // Connect to the database
    await mongoose.connect('mongodb://localhost:27017/packability')
    //mongoose.set('debug', true);

    // Start GraphQL Server
    const httpServer = http.createServer(app)
    const server = new ApolloServer({
        schema,
        context: setContext,
        plugins: [
            //logger,
            ApolloServerPluginDrainHttpServer({ httpServer }),
        ],
    })

    await server.start()
    server.applyMiddleware({ app, cors: false })

    await new Promise<void>(resolve =>
        httpServer.listen({ port: 4000 }, resolve),
    )
    console.log(
        `🚀  Server ready at http://localhost:4000${server.graphqlPath}`,
    )
    //sandbox()
}

startServer()
