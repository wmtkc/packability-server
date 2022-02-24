import { Schema, model, Document } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface Book extends Document {
    title: string;
    author: string;
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Book>({
    title: String,
    author: String
});

// 3. Create a Model for export.
export const Book = model<Book>('Book', schema);