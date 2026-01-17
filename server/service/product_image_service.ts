import { storageProductImage } from "./repos/productImage_repo";
import { CreateProductImageDTO, ProductImageResponseDTO } from "server/shared/dtos/ProductImage";
import { uploadImageToSupabase, deleteImageFromSupabase } from "server/shared/utils/supabaseStorage";

export const productImageService = {
  async uploadProductImages(
    productId: string,
    files: Buffer[],
    userId: string | undefined,
    userIp: string
  ): Promise<ProductImageResponseDTO[]> {
    const uploadedImages: ProductImageResponseDTO[] = [];

    for (const file of files) {
      try {
        // First, create the image record in the database to get its ID
        const imageRecord = await storageProductImage.createProductImage({
          productId,
          imageUrl: "", // Placeholder, will be updated after upload
          createdBy: userId,
          userIp,
        });

        // Upload the file to Supabase
        const uploadResult = await uploadImageToSupabase(
          file,
          productId,
          imageRecord.id
        );

        // Update the image record with the actual URL
        // Since we don't have an update method, we'll delete and recreate
        await storageProductImage.deleteProductImage(imageRecord.id);
        const finalImage = await storageProductImage.createProductImage({
          productId,
          imageUrl: uploadResult.imageUrl,
          createdBy: userId,
          userIp,
        });

        uploadedImages.push(finalImage);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error uploading image:", errorMessage);
        // Continue with other files - don't fail the entire product creation
      }
    }

    return uploadedImages;
  },

  async getProductImages(productId: string): Promise<ProductImageResponseDTO[]> {
    return await storageProductImage.getProductImages(productId);
  },

  async deleteProductImage(imageId: string, imageUrl: string): Promise<void> {
    // Extract file name from image URL
    const fileName = imageUrl.split("/").pop();
    if (fileName) {
      await deleteImageFromSupabase(fileName);
    }
    await storageProductImage.deleteProductImage(imageId);
  },

  async deleteProductImages(productId: string): Promise<void> {
    // Get all images for the product
    const images = await storageProductImage.getProductImages(productId);
    
    // Delete each image from Supabase
    for (const image of images) {
      if (image.imageUrl) {
        const fileName = image.imageUrl.split("/").pop();
        if (fileName) {
          await deleteImageFromSupabase(fileName);
        }
      }
    }
    
    // Delete from database
    await storageProductImage.deleteProductImagesByProductId(productId);
  },
};
