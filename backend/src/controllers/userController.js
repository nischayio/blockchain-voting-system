import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

export const uploadProfilePicture = async (req, res) => {
  try {
    // Check if Multer received an image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    // Find authenticated user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload image to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "NexusVote/profile-pictures",
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

      async (error, result) => {
        if (error) {
          console.error("CLOUDINARY UPLOAD ERROR:", error);

          return res.status(500).json({
            success: false,
            message: "Failed to upload profile picture",
          });
        }

        try {
          // Remember previous Cloudinary image
          const oldPublicId = user.profilePicturePublicId;

          // Update user with new image
          user.profilePicture = result.secure_url;
          user.profilePicturePublicId = result.public_id;

          await user.save();

          // Delete previous image only after MongoDB update succeeds
          if (oldPublicId) {
            try {
              await cloudinary.uploader.destroy(oldPublicId);
            } catch (deleteError) {
              console.error("OLD PROFILE PICTURE DELETE ERROR:", deleteError);
            }
          }

          return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            data: {
              profilePicture: user.profilePicture,
            },
          });
        } catch (error) {
          // If MongoDB failed after Cloudinary succeeded.
          // Remove newly uploaded image to prevent an orphan.
          try {
            await cloudinary.uploader.destroy(result.public_id);
          } catch (cleanupError) {
            console.error("CLOUDINARY CLEANUP ERROR:", cleanupError);
          }

          console.error("PROFILE PICTURE DATABASE ERROR:", error);

          return res.status(500).json({
            success: false,
            message: "Failed to update profile picture",
          });
        }
      },
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("PROFILE PICTURE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
