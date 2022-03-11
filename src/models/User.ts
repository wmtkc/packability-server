import { Document, Schema, model } from 'mongoose'

export interface User extends Document {
    username: string
    email: string
    passwordHash: string
    tokenVersion: number
    name: string
    bags: [Schema.Types.ObjectId]
    kits: [Schema.Types.ObjectId]
    createdAt: Date
    updatedAt: Date
}

const schema = new Schema<User>({
    username: String,
    email: String,
    passwordHash: String,
    tokenVersion: { type: Number, default: 0 },
    name: String,
    bags: [Schema.Types.ObjectId],
    kits: [Schema.Types.ObjectId],
    createdAt: Date,
    updatedAt: Date,
})

export const User = model<User>('User', schema)

/**
 * TODO:
 * - Add item list directly to user as well?
 *      Use for wishlist
 *      Only display extUrl for items on wishlist
 */
