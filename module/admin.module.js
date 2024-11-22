import mongoose from "mongoose";
import bcrypt from 'bcrypt';


// Admin schema definition (Mongoose model)
const adminSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true, // Ensuring phone number is unique
        match: /^[0-9]{10}$/, // Validates phone number as 10 digits
    },
    password: {
        type: String,
        required: true,
    }
});


export const Admin = mongoose.model('Admin', adminSchema);
