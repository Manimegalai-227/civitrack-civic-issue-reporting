const User = require('../models/User');
const Issue = require('../models/Issue');

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    let demoUser;

    if (userCount === 0) {
      demoUser = await User.create({
        name: 'Karthik Sundaram',
        email: 'citizen@civi.track',
        password: 'password123',
        phone: '9876543210',
        role: 'citizen',
      });
      console.log('Demo user seeded: citizen@civi.track / password123');
    } else {
      demoUser = await User.findOne();
    }

    const issueCount = await Issue.countDocuments();
    if (issueCount === 0 && demoUser) {
      const sampleIssues = [
        {
          caseNumber: 'CV-2026-0184',
          title: 'Deep Pothole on Main Bridge Road',
          category: 'Road / Pothole',
          status: 'Pending',
          location: 'Main Bridge Road, near Bus Stand',
          department: 'Roads & Highways Department',
          description: 'Large pothole causing two-wheeler accidents during rain. Reported by multiple citizens. Requires immediate tar patching.',
          image: '/assets/pothole.jpg',
          reportedBy: demoUser._id,
          reporterName: demoUser.name,
          reporterContact: demoUser.phone,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hr ago
        },
        {
          caseNumber: 'CV-2026-0181',
          title: 'Streetlight Out for 2 Weeks',
          category: 'Streetlight',
          status: 'In Progress',
          location: '5th Cross Street, Anna Nagar',
          department: 'Electrical Department',
          description: 'Entire stretch dark at night, safety concern for evening walkers and students. Municipal repair team assigned.',
          image: '/assets/streetlight.jpg',
          reportedBy: demoUser._id,
          reporterName: demoUser.name,
          reporterContact: demoUser.phone,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
          caseNumber: 'CV-2026-0179',
          title: 'Garbage Pile Not Collected',
          category: 'Garbage',
          status: 'Pending',
          location: 'Market Street Junction',
          department: 'Sanitation & Solid Waste Management',
          description: 'Garbage bin overflowing for 4 days, attracting stray animals near the vegetable market and emitting foul odor.',
          image: '/assets/garbage.jpg',
          reportedBy: demoUser._id,
          reporterName: demoUser.name,
          reporterContact: demoUser.phone,
          date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hr ago
        },
        {
          caseNumber: 'CV-2026-0173',
          title: 'Water Pipeline Leak',
          category: 'Water Leak / Supply',
          status: 'In Progress',
          location: 'Gandhi Nagar 2nd Street',
          department: 'Municipal Water Board',
          description: 'Continuous leak from main distribution line wasting treated drinking water and flooding the side lane. Crew dispatched.',
          image: '/assets/water-leak.jpg',
          reportedBy: demoUser._id,
          reporterName: demoUser.name,
          reporterContact: demoUser.phone,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          caseNumber: 'CV-2026-0166',
          title: 'Blocked Storm Drain',
          category: 'Drainage / Sewage',
          status: 'Resolved',
          location: 'Railway Feeder Road',
          department: 'Drainage & Public Health Works',
          description: 'Drain was clogged with construction debris causing waterlogging after rain. Desilted, debris cleared and natural flow restored.',
          image: '/assets/drainage.jpg',
          reportedBy: demoUser._id,
          reporterName: demoUser.name,
          reporterContact: demoUser.phone,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
        {
          caseNumber: 'CV-2026-0159',
          title: 'Sinking Road Patch',
          category: 'Road / Pothole',
          status: 'Resolved',
          location: 'Old Bypass, Zone 3',
          department: 'Roads & Highways Department',
          description: 'Road patch had sunk after heavy vehicle transit. Re-leveled and re-laid with fresh bituminous macadam.',
          image: '/assets/pothole.jpg',
          reportedBy: demoUser._id,
          reporterName: demoUser.name,
          reporterContact: demoUser.phone,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      ];

      await Issue.insertMany(sampleIssues);
      console.log('Sample civic issues seeded successfully!');
    } else {
      // Sync image paths for existing sample issues if they were missing or old
      const imageUpdates = [
        { caseNumber: 'CV-2026-0184', image: '/assets/pothole.jpg' },
        { caseNumber: 'CV-2026-0181', image: '/assets/streetlight.jpg' },
        { caseNumber: 'CV-2026-0179', image: '/assets/garbage.jpg' },
        { caseNumber: 'CV-2026-0173', image: '/assets/water-leak.jpg' },
        { caseNumber: 'CV-2026-0166', image: '/assets/drainage.jpg' },
        { caseNumber: 'CV-2026-0159', image: '/assets/pothole.jpg' },
      ];

      for (const update of imageUpdates) {
        await Issue.updateOne(
          { caseNumber: update.caseNumber },
          { $set: { image: update.image } }
        );
      }
      console.log('Synchronized sample issue images with frontend assets.');
    }
  } catch (error) {
    console.error('Seeding error (non-fatal):', error.message);
  }
};

module.exports = seedData;
