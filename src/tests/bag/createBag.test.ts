import { Bag } from '@models/Bag'
import { gql } from 'apollo-server-express'

import { useGlobalTestWrap } from '@lib/testHooks'

const testServer = useGlobalTestWrap({})

describe('create bag mutation', () => {
    const CREATE_BAG_MUTATION = gql`
        mutation CreateBag($name: String!, $owner: String!) {
            createBag(name: $name, owner: $owner) {
                id
                name
            }
        }
    `
    const correctVars = {
        name: 'test bag',
        owner: '622d23bc88f40cc8bdf4e80c', // staticTestUser
    }

    it.skip('correct variables', async () => {
        expect(1).toBe(1)
    })
})
