const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/civic_issue_db';

// Issue Schema (inline for seeding)
const issueSchema = new mongoose.Schema({
  caseNumber: { type: String, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Road / Pothole', 'Streetlight', 'Garbage', 'Water Leak / Supply', 'Drainage / Sewage', 'Other'],
  },
  description: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  department: { type: String, default: 'Civic Administration' },
  date: { type: Date, default: Date.now },
  reportedBy: { type: mongoose.Schema.Types.ObjectId },
  reporterName: { type: String, default: 'Citizen' },
  reporterContact: { type: String, default: '' },
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);

const sampleIssues = [
  {
    caseNumber: 'CV-2026-1001',
    title: 'Large pothole near bus stop on Anna Salai',
    category: 'Road / Pothole',
    description: 'A very deep pothole has formed near the main bus stop on Anna Salai. Two-wheelers are at high risk of accidents. Immediate repair is needed.',
    location: 'Anna Salai, Near Bus Stop No. 14, Chennai',
    status: 'Pending',
    department: 'Roads & Highways Department',
    reporterName: 'Ravi Kumar',
    reporterContact: '9876543210',
  },
  {
    caseNumber: 'CV-2026-1002',
    title: 'Streetlight not working for 2 weeks',
    category: 'Streetlight',
    description: 'The streetlight near the school entrance has been non-functional for 2 weeks. Children and pedestrians face safety risks during night time.',
    location: 'Gandhi Nagar, 3rd Street, Near Government School, Coimbatore',
    status: 'In Progress',
    department: 'Electrical Department',
    reporterName: 'Priya Lakshmi',
    reporterContact: '9123456780',
  },
  {
    caseNumber: 'CV-2026-1003',
    title: 'Garbage pile not collected for 5 days',
    category: 'Garbage',
    description: 'Garbage has been accumulating at the corner of 5th Cross Street for 5 days without collection. It is causing foul smell and attracting mosquitoes.',
    location: '5th Cross Street, Velachery, Chennai',
    status: 'Pending',
    department: 'Sanitation & Solid Waste Management',
    reporterName: 'Murugan S',
    reporterContact: '9988776655',
  },
  {
    caseNumber: 'CV-2026-1004',
    title: 'Water pipe burst on main road',
    category: 'Water Leak / Supply',
    description: 'A major water pipe has burst on the main road near the market. Water is flowing continuously causing road damage and wastage.',
    location: 'Market Road, Madurai Junction, Madurai',
    status: 'In Progress',
    department: 'Municipal Water Board',
    reporterName: 'Anitha Devi',
    reporterContact: '9870012345',
  },
  {
    caseNumber: 'CV-2026-1005',
    title: 'Drainage overflow flooding residential area',
    category: 'Drainage / Sewage',
    description: 'The main drainage channel is blocked and overflowing into residential streets. Houses are getting flooded every time it rains.',
    location: 'Kavitha Nagar, 2nd Main Road, Trichy',
    status: 'Pending',
    department: 'Drainage & Public Health Works',
    reporterName: 'Senthil Nathan',
    reporterContact: '9765432109',
  },
  {
    caseNumber: 'CV-2026-1006',
    title: 'Road damaged after heavy rain - urgent repair needed',
    category: 'Road / Pothole',
    description: 'Heavy rains have completely destroyed the road surface near the flyover. Large craters have formed making it impossible for vehicles to pass safely.',
    location: 'Flyover Junction, Ambattur Industrial Estate, Chennai',
    status: 'Resolved',
    department: 'Roads & Highways Department',
    reporterName: 'Karthik Raja',
    reporterContact: '9551234567',
  },
  {
    caseNumber: 'CV-2026-1007',
    title: 'Multiple streetlights down in housing colony',
    category: 'Streetlight',
    description: 'At least 5 streetlights in the housing colony are not working. The entire colony is in darkness at night causing fear among residents.',
    location: 'Nehru Nagar Housing Colony, Salem Road, Salem',
    status: 'Pending',
    department: 'Electrical Department',
    reporterName: 'Deepa Ramesh',
    reporterContact: '9443217890',
  },
  {
    caseNumber: 'CV-2026-1008',
    title: 'Illegal garbage dumping near lake',
    category: 'Garbage',
    description: 'People are illegally dumping garbage near the lake which is causing water pollution. The lake is a source of drinking water and this needs immediate action.',
    location: 'Near Valankulam Lake, Saravanampatti, Coimbatore',
    status: 'In Progress',
    department: 'Sanitation & Solid Waste Management',
    reporterName: 'Vijayakumar M',
    reporterContact: '9384756120',
  },
  {
    caseNumber: 'CV-2026-1009',
    title: 'No water supply for 3 days in ward 12',
    category: 'Water Leak / Supply',
    description: 'Entire Ward 12 has had no water supply for 3 consecutive days. Residents are struggling to get drinking water. Immediate intervention required.',
    location: 'Ward 12, Porur, Chennai',
    status: 'Pending',
    department: 'Municipal Water Board',
    reporterName: 'Meenakshi S',
    reporterContact: '9677891234',
  },
  {
    caseNumber: 'CV-2026-1010',
    title: 'Sewage smell near school - health hazard',
    category: 'Drainage / Sewage',
    description: 'A broken sewage line near the primary school is emitting unbearable smell. Students and teachers are falling sick. This is a serious health hazard.',
    location: 'Near Municipal Primary School, Tambaram East, Chennai',
    status: 'Resolved',
    department: 'Drainage & Public Health Works',
    reporterName: 'Suresh Babu',
    reporterContact: '9500112233',
  },
];

async function seedIssues() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected!');

    // Use a dummy ObjectId for reportedBy
    const dummyUserId = new mongoose.Types.ObjectId();

    const issuesWithUser = sampleIssues.map(issue => ({
      ...issue,
      reportedBy: dummyUserId,
    }));

    await Issue.insertMany(issuesWithUser);
    console.log('🎉 10 Sample Issues inserted successfully!');
    console.log('📋 Case Numbers: CV-2026-1001 to CV-2026-1010');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB Disconnected.');
  }
}

seedIssues();
