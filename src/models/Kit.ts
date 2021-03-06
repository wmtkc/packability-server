import { Document, Schema, model } from 'mongoose'

export enum KitType {
    Default = 'DEFAULT',
    Wishlist = 'WISHLIST',
    None = 'NONE',
}

// Default names
export const KitName = {
    Wishlist: 'Wishlist',
    Default: 'Uncategorized',
}

export interface Kit extends Document {
    name: string
    type: KitType
    owner: Schema.Types.ObjectId
    bag?: Schema.Types.ObjectId
    items: [
        {
            itemId: Schema.Types.ObjectId
            qty: number
        },
    ]
    createdAt: Date
    updatedAt: Date
}

const schema = new Schema<Kit>({
    name: String,
    type: String,
    owner: Schema.Types.ObjectId,
    bag: Schema.Types.ObjectId,
    items: [
        {
            itemId: Schema.Types.ObjectId,
            qty: Number,
        },
    ],
    createdAt: Date,
    updatedAt: Date,
})

export const Kit = model<Kit>('Kit', schema)
