import mongoose from 'mongoose';
import { VOLUNTEER } from '../config/limits';

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [VOLUNTEER.MAX_NAME_LENGTH, `Name must be ${VOLUNTEER.MAX_NAME_LENGTH} characters or fewer`]
  },
  email: {
    type: String,
    required: true,
    unique: true, // no duplicate profiles
    trim: true,
    lowercase: true,
    maxlength: [VOLUNTEER.MAX_EMAIL_LENGTH, `Email must be ${VOLUNTEER.MAX_EMAIL_LENGTH} characters or fewer`]
  }
}, {
  timestamps: true
});

export const Volunteer = mongoose.model('Volunteer', volunteerSchema);