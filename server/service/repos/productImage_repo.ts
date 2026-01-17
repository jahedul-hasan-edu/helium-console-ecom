import { eq, and } from "drizzle-orm";
import { db } from "server/db";
import { productImages } from "server/db/schemas/productImages";
import { CreateProductImageDTO, ProductImageResponseDTO } from "server/shared/dtos/ProductImage";

export interface IStorageProductImage {
  createProductImage(image: CreateProductImageDTO): Promise<ProductImageResponseDTO>;
  getProductImages(productId: string): Promise<ProductImageResponseDTO[]>;
  deleteProductImage(id: string): Promise<void>;
  deleteProductImagesByProductId(productId: string): Promise<void>;
  getProductImageByUrl(imageUrl: string): Promise<ProductImageResponseDTO | undefined>;
}

export class StorageProductImage implements IStorageProductImage {
  async createProductImage(image: CreateProductImageDTO): Promise<ProductImageResponseDTO> {
    const result = await db
      .insert(productImages)
      .values({
        productId: image.productId as any,
        imageUrl: image.imageUrl,
        createdBy: image.createdBy as any,
        createdOn: new Date(),
        userIp: image.userIp,
      })
      .returning();

    return this.mapToDTO(result[0]);
  }

  async getProductImages(productId: string): Promise<ProductImageResponseDTO[]> {
    const results = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId as any));

    return results.map((img) => this.mapToDTO(img));
  }

  async deleteProductImage(id: string): Promise<void> {
    await db
      .delete(productImages)
      .where(eq(productImages.id, id as any));
  }

  async deleteProductImagesByProductId(productId: string): Promise<void> {
    await db
      .delete(productImages)
      .where(eq(productImages.productId, productId as any));
  }

  async getProductImageByUrl(imageUrl: string): Promise<ProductImageResponseDTO | undefined> {
    const result = await db
      .select()
      .from(productImages)
      .where(eq(productImages.imageUrl, imageUrl));

    return result.length > 0 ? this.mapToDTO(result[0]) : undefined;
  }

  private mapToDTO(img: any): ProductImageResponseDTO {
    return {
      id: img.id,
      productId: img.productId,
      imageUrl: img.imageUrl,
      createdBy: img.createdBy,
      updatedBy: img.updatedBy,
      createdOn: img.createdOn,
      updatedOn: img.updatedOn,
      userIp: img.userIp,
    };
  }
}

export const storageProductImage = new StorageProductImage();
