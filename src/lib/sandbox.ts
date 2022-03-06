import { Bag } from '@models/Bag'
import { Item } from '@models/Item'
import schema from '@schemas/_schema'
import { ApolloServer } from 'apollo-server-express'
import 'dotenv/config'

const server = new ApolloServer({ schema })

export default async () => {}
