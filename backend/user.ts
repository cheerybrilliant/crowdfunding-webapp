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
userSchema.pre('save', async function (this: IUser) {
  // hash password logic here if using bcrypt
  if(this.isModified('password')) {
   try {
     const bcrypt = await import('bcryptjs');
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
   } catch (error) {
     throw new Error('Error hashing password');
   }
   
   
   
    // e.g., this.password = await bcrypt.hash(this.password, 10);
  }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;