import { ApolloServer } from 'apollo-server-express';
import schema from '@src/schemas/_schema';
import { Bag } from '@src/models/Bag';
import { Item } from '@src/models/Item';
import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const server = new ApolloServer({schema});

export default async () => {


}