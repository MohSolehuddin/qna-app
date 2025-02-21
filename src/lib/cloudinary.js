import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  secure: true,
});

const uploadToCloudinary = async (buffer) => {
  const { asset_id, public_id, created_at, height, width, secure_url } =
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "qna_uploads" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(buffer).pipe(stream);
    });
  return JSON.stringify({
    assetId: asset_id,
    publicId: public_id,
    createAt: created_at,
    height,
    width,
    imageUrl: secure_url,
  });
};

const deleteFromCloudinary = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

export { cloudinary, deleteFromCloudinary, uploadToCloudinary };
