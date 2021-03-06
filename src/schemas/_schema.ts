import { makeExecutableSchema } from '@graphql-tools/schema'
import * as schemas from '@schemas/_index'

const BaseQuery = `
    type Query {
        _: Boolean
    }
    type Mutation {
        _: Boolean
    }
`

const executableSchema: any = Object.values(schemas).reduce(
    (builder: any, schema: any) => {
        builder.typeDefs = [...builder.typeDefs, schema.typeDef]
        builder.resolvers = [...builder.resolvers, schema.resolvers]
        return builder
    },
    {
        typeDefs: [BaseQuery],
        resolvers: [],
    },
)

export default makeExecutableSchema(executableSchema)
