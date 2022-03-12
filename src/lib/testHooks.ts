import schema from '@schemas/_schema'
import { ApolloServer } from 'apollo-server-express'
import mongoose from 'mongoose'

/**
 *
 * @param param0 {
 *  beforeAllFn -- additional function to be run in beforeAll()
 *  afterAllFn -- additional function to be run in afterAll()
 *  beforeEachFn -- additional function to be run in beforeEach()
 *  afterEachFn -- additional function to be run in afterEach()
 * }
 * @returns global ApolloServer testing instance
 */
export const useGlobalTestWrap = ({
    beforeAllFn,
    afterAllFn,
    beforeEachFn,
    afterEachFn,
}: {
    beforeAllFn?: () => void
    afterAllFn?: () => void
    beforeEachFn?: () => void
    afterEachFn?: () => void
}) => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/packability-test')
        if (beforeAllFn) beforeAllFn()
    })

    afterAll(async () => {
        await mongoose.disconnect()
        if (afterAllFn) afterAllFn()
    })

    beforeEach(() => {
        if (beforeEachFn) beforeEachFn()
    })

    afterEach(() => {
        if (afterEachFn) afterEachFn()
    })

    return new ApolloServer({ schema })
}
