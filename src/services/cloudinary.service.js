const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary
 * @param {string} filePath - Local path to the file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} - Cloudinary upload result
 */
exports.uploadImage = async (filePath, folder = "ecoversex") => {
  try {
    if (!filePath) return null;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });

    // Remove file from local storage after upload
    fs.unlinkSync(filePath);

    return result;
  } catch (error) {
    // Remove file from local storage if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Deletes an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} - Cloudinary deletion result
 */
exports.deleteImage = async (publicId) => {
  try {
    if (!publicId) return null;
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};
