const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/civic_issue_db';

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
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  department: { type: String, default: 'Civic Administration' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId },
  reporterName: { type: String, default: 'Citizen' },
  reporterContact: { type: String, default: '' },
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);

async function runCRUD() {
  await mongoose.connect(MONGODB_URI);
  console.log('\n✅ MongoDB Connected!\n');
  console.log('='.repeat(60));

  // =============================================
  // 1. CREATE — New Issue Add Pannuva
  // =============================================
  console.log('\n📝 [CREATE] — New Issue Adding...');
  const newIssue = await Issue.create({
    caseNumber: 'CV-2026-9999',
    title: 'TEST: Big pothole on Ring Road near flyover',
    category: 'Road / Pothole',
    description: 'A huge pothole has formed on the Ring Road near the flyover. Very dangerous for two-wheelers especially at night.',
    location: 'Ring Road, Near Old Flyover, Chennai',
    status: 'Pending',
    department: 'Roads & Highways Department',
    reportedBy: new mongoose.Types.ObjectId(),
    reporterName: 'Test Citizen',
    reporterContact: '9999988888',
  });
  console.log('✅ Issue Created!');
  console.log(`   Case Number : ${newIssue.caseNumber}`);
  console.log(`   Title       : ${newIssue.title}`);
  console.log(`   Status      : ${newIssue.status}`);
  console.log(`   ID          : ${newIssue._id}`);

  console.log('\n' + '='.repeat(60));

  // =============================================
  // 2. READ — Yella Issues Paakuva
  // =============================================
  console.log('\n📖 [READ] — All Issues List:');
  const allIssues = await Issue.find().select('caseNumber title status category').limit(5);
  allIssues.forEach((issue, i) => {
    console.log(`   ${i + 1}. [${issue.caseNumber}] ${issue.title}`);
    console.log(`      Category: ${issue.category} | Status: ${issue.status}`);
  });
  console.log(`   ... (Showing first 5 of ${await Issue.countDocuments()} total issues)`);

  console.log('\n' + '='.repeat(60));

  // =============================================
  // 3. UPDATE — Status Change Pannuva
  // =============================================
  console.log('\n✏️  [UPDATE] — Status: Pending → In Progress');
  const updated = await Issue.findOneAndUpdate(
    { caseNumber: 'CV-2026-9999' },
    { status: 'In Progress' },
    { new: true }
  );
  console.log(`✅ Issue Updated!`);
  console.log(`   Case Number : ${updated.caseNumber}`);
  console.log(`   Old Status  : Pending`);
  console.log(`   New Status  : ${updated.status}`);

  console.log('\n' + '='.repeat(60));

  // =============================================
  // 4. UPDATE — Status Resolved ku maathuva
  // =============================================
  console.log('\n✏️  [UPDATE] — Status: In Progress → Resolved');
  const resolved = await Issue.findOneAndUpdate(
    { caseNumber: 'CV-2026-9999' },
    { status: 'Resolved' },
    { new: true }
  );
  console.log(`✅ Issue Resolved!`);
  console.log(`   Case Number : ${resolved.caseNumber}`);
  console.log(`   New Status  : ${resolved.status}`);

  console.log('\n' + '='.repeat(60));

  // =============================================
  // 5. DELETE — Issue Delete Pannuva
  // =============================================
  console.log('\n🗑️  [DELETE] — Test Issue Delete Pannurom...');
  const deleted = await Issue.findOneAndDelete({ caseNumber: 'CV-2026-9999' });
  console.log(`✅ Issue Deleted!`);
  console.log(`   Deleted : [${deleted.caseNumber}] ${deleted.title}`);

  console.log('\n' + '='.repeat(60));
  console.log('\n🎉 CRUD Demo Complete! C-R-U-U-D Yella Nadandhadhu!\n');

  await mongoose.disconnect();
  console.log('🔌 MongoDB Disconnected.\n');
}

runCRUD().catch(err => {
  console.error('❌ Error:', err.message);
  mongoose.disconnect();
});
