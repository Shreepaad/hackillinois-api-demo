import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
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
    min: [1, 'Capacity must be at least 1'] // needs a copacity of at least 1
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