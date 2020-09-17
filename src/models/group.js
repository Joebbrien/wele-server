const mongoose = require("mongoose");
const moment = require("moment-timezone");


const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true
  },
  groupDescription: {
    type: String,
    required: true
  },
  totalSaving: {
    type: Number,
    default: 0.0
  },
  loanedTotalAmount: {
    type: Number,
    default:0.0,
    required:false
  },
  bankAccountNumber: {
    type: Number,
    required: true
  },
  bankAccountName: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  shareCost: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    default: moment()
      .tz("Africa/Windhoek")
      .format("LLL")
  },
  execMembers: [
    userId: {
       type: mongoose.Schema.Types.ObjectId,
        required: true
      },
     memberType: {
        type: String,
        required: true
    },
  ],
  members: [
    userId: {
       type: mongoose.Schema.Types.ObjectId,
        required: true
      },
     totalSavings: {
        type: Number,
        required: true
     },
     totalLoan: {
        type: Number,
        required: true
     },
     totalLoanReturned: {
        type: Number,
        required: true
     },
  ],
}, {timestamps: true});

module.exports = mongoose.model("groups", groupSchema);
