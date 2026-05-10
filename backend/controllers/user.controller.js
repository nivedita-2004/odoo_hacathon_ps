const userQueries = require('../queries/user.queries');
const tripQueries = require('../queries/trip.queries');
const { uploadProfilePhoto, deleteImage } = require('../utils/cloudinary');
const { asyncHandler } = require('../middleware/error.middleware');

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user.id;
  
  const user = await userQueries.findById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  const allowedFields = ['full_name', 'phone', 'bio', 'preferred_currency', 'language_preference'];
  const filteredData = {};
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  if (Object.keys(filteredData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  const updated = await userQueries.update(userId, filteredData);
  
  if (!updated) {
    return res.status(400).json({
      success: false,
      message: 'Failed to update profile'
    });
  }

  const user = await userQueries.findById(userId);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

const updateProfilePhoto = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const user = await userQueries.findById(userId);
  
  if (user.profile_photo) {
    const oldPublicId = user.profile_photo.split('/').pop().split('.')[0];
    if (oldPublicId) {
      await deleteImage(`traveloop/users/${userId}/${oldPublicId}`);
    }
  }

  const uploadResult = await uploadProfilePhoto(req.file.buffer, userId);
  
  const updated = await userQueries.update(userId, { profile_photo: uploadResult.url });
  
  if (!updated) {
    return res.status(400).json({
      success: false,
      message: 'Failed to update profile photo'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Profile photo updated successfully',
    data: { 
      profile_photo: uploadResult.url,
      public_id: uploadResult.public_id
    }
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  await userQueries.updateStatus(userId, 'deleted');

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const stats = await userQueries.getDashboardStats(userId);
  const recentTrips = await userQueries.getRecentTrips(userId, 5);

  res.status(200).json({
    success: true,
    data: {
      stats,
      recent_trips: recentTrips
    }
  });
});

const getUserTrips = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user.id;
  const { page = 1, limit = 10, visibility } = req.query;

  const result = await tripQueries.findByUserId(
    userId, 
    visibility, 
    parseInt(page), 
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  getProfile,
  updateProfile,
  updateProfilePhoto,
  deleteAccount,
  getDashboard,
  getUserTrips
};
