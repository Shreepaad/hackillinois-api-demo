import mongoose from 'mongoose';
import { SHIFT } from '../config/limits';

const shiftSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [SHIFT.MAX_TITLE_LENGTH, `Title must be ${SHIFT.MAX_TITLE_LENGTH} characters or fewer`]
  },
  // ISO 8601 str format, specifies date and time
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1'], // needs a copacity of at least 1
    max: [SHIFT.MAX_CAPACITY, `Capacity must be ${SHIFT.MAX_CAPACITY} or fewer`]
  },
  // relational approach
  // links to the Volunteer collection
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  }]
}, { 
  timestamps: true
});

export const Shift = mongoose.model('Shift', shiftSchema);