import { Schema, model, Document } from 'mongoose';

interface Bag extends Document {
    name: string
    owner: Schema.Types.ObjectId,
    items: [{
        item_id: Schema.Types.ObjectId, 
        qty: number
    }],
    createdAt: Date,
    updatedAt: Date
}

// TODO: add item quantities
const schema = new Schema<Bag>({
    name: String,
    owner: Schema.Types.ObjectId,
    items: [{
        item_id: Schema.Types.ObjectId,
        qty: Number
    }],
    createdAt: Date,
    updatedAt: Date
});

export const Bag = model<Bag>('Bag', schema);