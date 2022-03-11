import { Document, Schema, model } from 'mongoose'

export enum ItemType {
    Product = 'PRODUCT',
    NonProduct = 'NON_PRODUCT',
    Generic = 'GENERIC',
}

// 1. Create an interface representing a document in MongoDB.
export interface Item extends Document {
    name: string
    type: ItemType
    extUrl?: string
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Item>({
    name: String,
    type: String,
    extUrl: String,
})

// 3. Create a Model for export.
export const Item = model<Item>('Item', schema)

/**
 * TODO:
 * - Countable vs Uncountable items e.g. 50g coffee grounds
 * - Individual item weight
 */
