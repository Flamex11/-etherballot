const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['national', 'state', 'district'],
    required: true
  },
  state: {
    type: String,
    default: null   // for state/district level elections
  },
  district: {
    type: String,
    default: null   // for district level elections
  },
  candidates: [{
    name: { type: String, required: true },
    party: { type: String, required: true },
    symbol: { type: String },
    imageUrl: { type: String },
    manifesto: { type: String }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  totalVoters: {
    type: Number,
    default: 0
  },
  totalVotesCast: {
    type: Number,
    default: 0
  },
  blockchainElectionId: {
    type: Number,
    default: null  // ID on the smart contract
  },
  results: [{
    candidateIndex: Number,
    candidateName: String,
    party: String,
    voteCount: Number
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  auditLog: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    timestamp: { type: Date, default: Date.now },
    details: String
  }]
}, {
  timestamps: true
});

electionSchema.index({ status: 1 });
electionSchema.index({ type: 1, state: 1 });

module.exports = mongoose.model('Election', electionSchema);
