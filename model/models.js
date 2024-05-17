import dotenv from "dotenv";
dotenv.config({
  path: "./.env.local",
});
import mongoose, { Schema } from 'mongoose'
import encrypt from 'mongoose-encryption'



const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
}, {timestamps: true})

const secretSchema = new Schema({
    secret: {
        type: String,
        required: true
    }
}, {timestamps: true})

const userKey = process.env.USER_KEY
const secretKey = process.env.SECRET_KEY

console.log(userKey, secretKey)

userSchema.plugin(encrypt, { secret: userKey, encryptedFields: ['password'] });
secretSchema.plugin(encrypt, { secret: secretKey, encryptedFields: ['secret'] });


const User = mongoose.model('User', userSchema);
const Secret = mongoose.model('Secret', secretSchema);


export { User, Secret }