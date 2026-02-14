import { db } from "server/db";
import { homeSettingImages } from "server/db/schemas/homeSettingImages";
import { CreateHomeSettingImageDTO, HomeSettingImageResponseDTO } from "server/shared/dtos/HomeSettingImage";
import { uploadImageToSupabase, deleteImageFromSupabase } from "server/shared/utils/supabaseStorage";
import { eq } from "drizzle-orm";

export const homeSettingImageService = {
  async uploadHomeSettingImages(
    homeSettingId: string,
    files: Buffer[],
    userId: string | undefined,
    userIp: string
  ): Promise<HomeSettingImageResponseDTO[]> {
    const uploadedImages: HomeSettingImageResponseDTO[] = [];

    for (const file of files) {
      try {
        // First, create the image record in the database to get its ID
        const imageRecord = await db.insert(homeSettingImages).values({
          homeSettingId,
          imageUrl: "", // Placeholder, will be updated after upload
          createdBy: userId ? userId as any : undefined,
          userIp,
          createdOn: new Date(),
        }).returning();

        const record = imageRecord[0];

        // Upload the file to Supabase
        const uploadResult = await uploadImageToSupabase(
          file,
          homeSettingId,
          record.id,
          "home_setting_images"
        );

        // Update the image record with the actual URL
        const updateResult = await db
          .update(homeSettingImages)
          .set({ imageUrl: uploadResult.imageUrl, updatedOn: new Date() })
          .where(eq(homeSettingImages.id, record.id))
          .returning();

        const updated = updateResult[0];
        uploadedImages.push({
          id: updated.id,
          homeSettingId: updated.homeSettingId,
          imageUrl: updated.imageUrl,
          createdBy: updated.createdBy,
          updatedBy: updated.updatedBy,
          createdOn: updated.createdOn,
          updatedOn: updated.updatedOn,
          userIp: updated.userIp,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error uploading image:", errorMessage);
        // Continue with other files - don't fail the entire home setting creation
      }
    }

    return uploadedImages;
  },

  async getHomeSettingImages(homeSettingId: string): Promise<HomeSettingImageResponseDTO[]> {
    const images = await db
      .select()
      .from(homeSettingImages)
      .where(eq(homeSettingImages.homeSettingId, homeSettingId));

    return images.map((img) => ({
      id: img.id,
      homeSettingId: img.homeSettingId,
      imageUrl: img.imageUrl,
      createdBy: img.createdBy,
      updatedBy: img.updatedBy,
      createdOn: img.createdOn,
      updatedOn: img.updatedOn,
      userIp: img.userIp,
    }));
  },

  async deleteHomeSettingImage(imageId: string, imageUrl: string): Promise<void> {
    // Extract file name from image URL
    const fileName = imageUrl.split("/").pop();
    if (fileName) {
      await deleteImageFromSupabase(fileName, "home_setting_images");
    }
    await db.delete(homeSettingImages).where(eq(homeSettingImages.id, imageId));
  },

  async deleteHomeSettingImages(homeSettingId: string): Promise<void> {
    // Get all images for the home setting
    const images = await db
      .select()
      .from(homeSettingImages)
      .where(eq(homeSettingImages.homeSettingId, homeSettingId));
    
    // Delete each image from Supabase
    for (const image of images) {
      if (image.imageUrl) {
        const fileName = image.imageUrl.split("/").pop();
        if (fileName) {
          await deleteImageFromSupabase(fileName, "home_setting_images");
        }
      }
    }
    
    // Delete from database
    await db.delete(homeSettingImages).where(eq(homeSettingImages.homeSettingId, homeSettingId));
  },
};
