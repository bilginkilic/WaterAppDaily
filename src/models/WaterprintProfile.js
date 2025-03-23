const mongoose = require('mongoose');

const waterprintProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initialWaterprint: {
    type: Number,
    required: true
  },
  currentWaterprint: {
    type: Number,
    required: true
  },
  initialAssessment: {
    answers: [{
      questionId: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }],
    correctAnswersCount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  completedTasks: [{
    taskId: {
      type: String,
      required: true
    },
    waterprintReduction: {
      type: Number,
      required: true
    },
    completionDate: {
      type: Date,
      default: Date.now
    }
  }],
  progressHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    waterprint: {
      type: Number,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Güncelleme öncesi updatedAt alanını güncelle
waterprintProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('WaterprintProfile', waterprintProfileSchema); 