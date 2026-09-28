const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['Road / Pothole', 'Streetlight', 'Garbage', 'Water Leak / Supply', 'Drainage / Sewage', 'Other'],
        message: '{VALUE} is not a supported category',
      },
    },
    description: {
      type: String,
      required: [true, 'Please provide an issue description'],
      trim: true,
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location or landmark'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Resolved'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
    department: {
      type: String,
      default: 'Civic Administration',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterName: {
      type: String,
      default: 'Citizen',
    },
    reporterContact: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate case number and department before saving
issueSchema.pre('validate', function (next) {
  if (!this.caseNumber) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.caseNumber = `CV-2026-${randomDigits}`;
  }

  // Auto assign department based on category if default
  if (!this.department || this.department === 'Civic Administration') {
    switch (this.category) {
      case 'Road / Pothole':
        this.department = 'Roads & Highways Department';
        break;
      case 'Streetlight':
        this.department = 'Electrical Department';
        break;
      case 'Garbage':
        this.department = 'Sanitation & Solid Waste Management';
        break;
      case 'Water Leak / Supply':
        this.department = 'Municipal Water Board';
        break;
      case 'Drainage / Sewage':
        this.department = 'Drainage & Public Health Works';
        break;
      default:
        this.department = 'Civic Administration';
    }
  }

  next();
});

module.exports = mongoose.model('Issue', issueSchema);
