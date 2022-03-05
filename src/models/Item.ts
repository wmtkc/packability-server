import { Document, Schema, model } from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface Item extends Document {
    name: string
    extUrl: string
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Item>({
    name: String,
    extUrl: String,
})

// 3. Create a Model for export.
export const Item = model<Item>('Item', schema)

/**
 * TODO:
 * - Countable vs Uncountable items e.g. 50g coffee grounds
 * - Individual item weight
 */
