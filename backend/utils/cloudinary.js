const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadImage = async (fileBuffer, folder = 'traveloop') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

const uploadProfilePhoto = async (fileBuffer, userId) => {
  const folder = `traveloop/users/${userId}`;
  return await uploadImage(fileBuffer, folder);
};

const uploadTripCover = async (fileBuffer, tripId) => {
  const folder = `traveloop/trips/${tripId}`;
  return await uploadImage(fileBuffer, folder);
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
};

const getImageUrl = (publicId, options = {}) => {
  const transformations = [];
  
  if (options.width) transformations.push({ width: options.width, crop: 'limit' });
  if (options.height) transformations.push({ height: options.height, crop: 'limit' });
  if (options.quality) transformations.push({ quality: options.quality });
  
  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadProfilePhoto,
  uploadTripCover,
  deleteImage,
  getImageUrl
};
