import { Schema, model, Document } from 'mongoose';

interface User extends Document {
    username: string
    email: string
    passwordHash: string
    name: string
    bags: [Schema.Types.ObjectId],
    createdAt: Date,
    updatedAt: Date
}

const schema = new Schema<User>({
    username: String,
    email: String,
    passwordHash: String,
    name: String,
    bags: [Schema.Types.ObjectId],
    createdAt: Date,
    updatedAt: Date
});

export const User = model<User>('User', schema);

/**
 * TODO:
 * - Add item list directly to user as well? 
 *      Use for wishlist
 *      Only display extUrl for items on wishlist
 */