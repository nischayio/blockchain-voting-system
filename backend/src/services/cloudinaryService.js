import cloudinary from "../config/cloudinary.js";

export const uploadCandidateImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "NexusVote/candidates",
        resource_type: "image",

        transformation: [
          {
            width: 500,
            height: 500,
            crop: "fill",
            gravity: "face",
          },
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  return cloudinary.uploader.destroy(publicId);
};
