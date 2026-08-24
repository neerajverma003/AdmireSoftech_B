import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: null
    },
    resetPasswordOtp: {
        type: String,
        default: null
    },
    resetPasswordOtpExpires: {
        type: Date,
        default: null
    }
}, {timestamps : true} )

export const User = mongoose.model('User', userSchema)
