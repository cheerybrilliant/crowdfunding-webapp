import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // hashed in real apps
  createdAt: Date;
}

const userSchema: Schema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Add indexes, virtuals, pre-save hooks (e.g., hash password)
userSchema.pre('save', async function (next) {
  // hash password logic here if using bcrypt
  next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;