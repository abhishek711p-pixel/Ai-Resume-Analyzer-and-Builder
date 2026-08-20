import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    fullName: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// High-Performance Index: Fast O(1) user lookups on authentication and session validation
UserSchema.index({ username: 1 });

// Export User model
export default mongoose.model<IUser>('User', UserSchema);
