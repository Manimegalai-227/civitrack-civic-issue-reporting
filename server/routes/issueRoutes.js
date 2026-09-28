const express = require('express');
const router = express.Router();
const path = require('path');
const Issue = require('../models/Issue');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/issues
// @desc    Get all issues with optional filtering & search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category && category !== 'all' && category !== 'All') {
      // Map short categories or exact match
      const categoryMap = {
        road: 'Road / Pothole',
        light: 'Streetlight',
        garbage: 'Garbage',
        water: 'Water Leak / Supply',
        drain: 'Drainage / Sewage',
      };
      query.category = categoryMap[category] || category;
    }

    if (status && status !== 'all' && status !== 'All') {
      const statusMap = {
        pending: 'Pending',
        progress: 'In Progress',
        resolved: 'Resolved',
      };
      query.status = statusMap[status] || status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { caseNumber: { $regex: s, $options: 'i' } },
      ];
    }

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email phone');

    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    console.error('Fetch issues error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve issues',
      error: error.message,
    });
  }
});

// @route   GET /api/issues/my-reports
// @desc    Get all issues filed by the logged-in user
// @access  Private
router.get('/my-reports', protect, async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    console.error('Fetch my reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your reports',
      error: error.message,
    });
  }
});

// @route   GET /api/issues/:id
// @desc    Get single issue details by ID or CaseNumber
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let issue;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      issue = await Issue.findById(id).populate('reportedBy', 'name email phone');
    } else {
      issue = await Issue.findOne({ caseNumber: id }).populate('reportedBy', 'name email phone');
    }

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Civic issue record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error('Get issue details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve issue details',
      error: error.message,
    });
  }
});

// @route   POST /api/issues
// @desc    Submit a new civic issue with optional image upload
// @access  Private
router.post('/', protect, (req, res) => {
  // Use multer upload middleware
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed. Ensure file is an image under 5MB.',
      });
    }

    try {
      const { title, category, description, location, status } = req.body;

      // Backend validation
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Please provide an issue title' });
      }
      if (!category || !category.trim()) {
        return res.status(400).json({ success: false, message: 'Please select an issue category' });
      }
      if (!description || !description.trim()) {
        return res.status(400).json({ success: false, message: 'Please provide a detailed description' });
      }
      if (!location || !location.trim()) {
        return res.status(400).json({ success: false, message: 'Please provide the issue location or landmark' });
      }

      // Determine image URL / path
      let imagePath = '';
      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      } else if (req.body.imageUrl && req.body.imageUrl.trim()) {
        imagePath = req.body.imageUrl.trim();
      }

      // Valid statuses
      const validStatuses = ['Pending', 'In Progress', 'Resolved'];
      const issueStatus = validStatuses.includes(status) ? status : 'Pending';

      const newIssue = new Issue({
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        location: location.trim(),
        image: imagePath,
        status: issueStatus,
        date: new Date(),
        reportedBy: req.user._id,
        reporterName: req.user.name || 'Citizen',
        reporterContact: req.user.phone || req.body.contact || '',
      });

      const savedIssue = await newIssue.save();

      return res.status(201).json({
        success: true,
        message: `Case ${savedIssue.caseNumber} filed successfully! It has been routed to the department.`,
        data: savedIssue,
      });
    } catch (error) {
      console.error('Create issue error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error occurred while saving issue',
      });
    }
  });
});

// @route   PATCH /api/issues/:id/status
// @desc    Update status of an issue (Pending / In Progress / Resolved)
// @access  Private (Reporter or Admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, In Progress, or Resolved',
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.status = status;
    await issue.save();

    return res.status(200).json({
      success: true,
      message: `Status updated to "${status}"`,
      data: issue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
});

// @route   DELETE /api/issues/:id
// @desc    Delete an issue
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Only creator or admin can delete
    if (issue.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this issue' });
    }

    await issue.deleteOne();
    return res.status(200).json({
      success: true,
      message: 'Issue report deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete issue',
      error: error.message,
    });
  }
});

module.exports = router;
