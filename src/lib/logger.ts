export default {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart(requestContext: any) {
        if (requestContext.request.query.includes('IntrospectionQuery')) return

        console.log('New Request Query:\n' + requestContext.request.query)

        if (requestContext.request.variables) {
            console.log('Vars:')
            console.dir(requestContext.request.variables)
        }

        if (requestContext.request.headers) {
            console.log('Headers:')
            console.dir(requestContext.request.headers)
        }

        return {
            // Fires whenever Apollo Server will parse a GraphQL
            // request to create its associated document AST.
            async parsingDidStart(requestContext: any) {
                console.log('parsing...')
            },

            // Fires whenever Apollo Server will validate a
            // request's document AST against your GraphQL schema.
            async validationDidStart(requestContext: any) {
                console.log('validating...')
            },
        }
    },
}
