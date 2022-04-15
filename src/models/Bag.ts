import { Document, Schema, model } from 'mongoose'

export interface Bag extends Document {
    name: string
    owner: Schema.Types.ObjectId
    kits: [
        {
            kitId: Schema.Types.ObjectId
            qty: number
        },
    ]
    defaultKit: Schema.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const schema = new Schema<Bag>({
    name: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    kits: [
        {
            kitId: { type: Schema.Types.ObjectId, ref: 'Kit' },
            qty: Number,
        },
    ],
    defaultKit: { type: Schema.Types.ObjectId, ref: 'Kit' },
    createdAt: Date,
    updatedAt: Date,
})

export const Bag = model<Bag>('Bag', schema)
