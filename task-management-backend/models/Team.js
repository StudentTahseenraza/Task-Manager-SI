const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a team name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

teamSchema.index({ managerId: 1 });
teamSchema.index({ members: 1 });

module.exports = mongoose.model('Team', teamSchema);