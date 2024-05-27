import mongoose, { Schema } from "mongoose";
import findOrCreatePlugin from "mongoose-findorcreate";

const userSchema = new Schema(
  {
    username: String,
    password: String,
    googleId: String,
    githubId: String,
    secrets: [String]
  },
  { timestamps: true }
);


userSchema.plugin(findOrCreatePlugin);

const User = mongoose.model("User", userSchema);

export { User };
