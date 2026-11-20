const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, trim: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
  emergencyContact: { type: String, trim: true },
  allergies: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Child', childSchema);
