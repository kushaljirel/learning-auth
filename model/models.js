import mongoose, { Schema } from "mongoose";
import findOrCreatePlugin from "mongoose-findorcreate";

const userSchema = new Schema(
  {
    username: String,
    password: String,
    googleId: String,
    githubId: String
  },
  { timestamps: true }
);

const secretSchema = new Schema(
  {
    secret: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.plugin(findOrCreatePlugin);

const User = mongoose.model("User", userSchema);
const Secret = mongoose.model("Secret", secretSchema);

export { User, Secret };
