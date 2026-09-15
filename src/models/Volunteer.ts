import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // no duplicate profiles
  }
}, {
  timestamps: true
});

export const Volunteer = mongoose.model('Volunteer', volunteerSchema);