"use server";

import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary with environment variables
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

/**
 * Uploads a file buffer to Cloudinary using their upload stream approach
 * suitable for Next.js server actions receiving FormData/File objects.
 * 
 * @param formData FormData containing the file to upload
 * @param folder The target folder path in Cloudinary
 * @returns The secure URL of the uploaded image
 */
export async function uploadImageToCloudinary(formData: FormData, folder: string): Promise<string> {
  const file = formData.get("file") as File | null;
  
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: "auto" // Automatically detect if it's image, raw, video, etc.
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(new Error(error.message || "Failed to upload to Cloudinary"));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Unknown error occurred during upload"));
        }
      }
    );

    // Write buffer to stream
    stream.write(buffer);
    stream.end();
  });
}
