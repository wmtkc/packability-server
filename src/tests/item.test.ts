import { Item } from '@models/Item'
import { gql } from 'apollo-server-express'
import mongoose from 'mongoose'

import { useGlobalTestWrap } from '@lib/testHelpers'

const testServer = useGlobalTestWrap()

describe('create item mutation', () => {
    it('dummy', () => {
        expect(1).toBe(1)
    })
})

describe('delete item mutation', () => {})

describe('edit item mutation', () => {})
