import { UploadApiResponse } from "cloudinary";
import cloudinary from "../lib/cloudinary";

export const uploadToCloudinary = async (
  file: File,
  folder: string
): Promise<UploadApiResponse> => {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `whatsapp-clone/${folder}`,
          resource_type: "auto",
        },
        (error, result) => {
            if (error) {
                reject(error);
                return;
            }

            if (!result) {
                reject(new Error("Cloudinary upload returned no result"));
                return;
            }

            resolve(result);
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};