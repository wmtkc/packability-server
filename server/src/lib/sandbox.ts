import { ApolloServer } from 'apollo-server';
import schema from '@src/schemas/_schema';
import { Bag } from '@src/models/Bag';
import { Item } from '@src/models/Item';
import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const server = new ApolloServer({schema});

export default async () => {

    const databaseId = '200b8f904dfe4285a0cd58649ffa3c9a';
    try {
        const response = await notion.databases.query({
          database_id: databaseId,
          filter: {
              property: 'Published',
              checkbox: {
                  equals: true,
              },
          },
          sorts: [
            {
              property: 'Date',
              direction: 'ascending',
            },
          ],
        });

        if (response.results) {
            // @ts-ignore
            console.log(response.results[0]);

            response.results.forEach(async (page, i) => {
                if (page.id) {
                    const pageObj = await notion.pages.retrieve({ page_id: page.id });
                    if (i === 2) console.log(pageObj);
                }
            });
        }
    } catch (e) {
        console.dir(e);
    }

}