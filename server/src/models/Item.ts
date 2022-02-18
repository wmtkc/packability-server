import { Schema, model, Document } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface Item extends Document {
    name: string
    url: string
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Item>({
    name: String,
    url: String
});

// 3. Create a Model for export.
export const Item = model<Item>('Item', schema);

/**
 * TODO:
 * - Countable vs Uncountable items e.g. 50g coffee grounds
 * - Individual item weight        
 */