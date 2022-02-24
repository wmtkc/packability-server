import { Schema, model, Document } from 'mongoose';

export interface Bag extends Document {
    name: string
    owner: Schema.Types.ObjectId,
    items: [{
        itemId: Schema.Types.ObjectId, 
        qty: number
    }],
    createdAt: Date,
    updatedAt: Date
}

const schema = new Schema<Bag>({
    name: String,
    owner: Schema.Types.ObjectId,
    items: [{
        itemId: Schema.Types.ObjectId,
        qty: Number
    }],
    createdAt: Date,
    updatedAt: Date
});

export const Bag = model<Bag>('Bag', schema);