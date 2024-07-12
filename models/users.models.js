import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
      username: {
            type: String,
            required: true,
            unique: true
      },
      fullName: {
            type: String,
            required: true
      },
      email: {
            type: String,
            required: true,
            unique: true,
      },
      profileImage: {
            type: String,
            required: true,
      },
      password: {
            type: String,
            required: true,
      },
      isSeller: {
            type: Boolean,
            default: false,
      },

}, { timestamps: true });

export const User = mongoose.model("User", userSchema);