const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = (buffer, mimeType) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "cooksmart/pantry", resource_type: "image" },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(buffer);
  });

const deleteImage = (publicId) =>
  cloudinary.uploader.destroy(publicId, { resource_type: "image" });

module.exports = { uploadImage, deleteImage };
