import { Bag } from '@models/Bag'
import { Item } from '@models/Item'
import { Client } from '@notionhq/client'
import schema from '@schemas/_schema'
import { ApolloServer } from 'apollo-server-express'
import 'dotenv/config'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

const server = new ApolloServer({ schema })

export default async () => {}
