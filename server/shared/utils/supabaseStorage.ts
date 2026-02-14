import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = "helium-ecom-bucket";

if (!SUPABASE_URL) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_URL - image uploads will not work");
}

if (!SUPABASE_ANON_KEY) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY - image uploads will not work");
}

// Validate service key format (should be a valid JWT)
const isValidServiceKey = SUPABASE_SERVICE_KEY && 
  SUPABASE_SERVICE_KEY !== "your_service_role_key_here" &&
  SUPABASE_SERVICE_KEY.split(".").length === 3;

if (!SUPABASE_SERVICE_KEY) {
  console.warn("Missing SUPABASE_SERVICE_ROLE_KEY - will use anon key (may fail with RLS)");
} else if (!isValidServiceKey) {
  console.warn("Invalid or placeholder SUPABASE_SERVICE_ROLE_KEY format - will use anon key (may fail with RLS)");
}

// For server-side uploads, prioritize service role key if valid
// Fall back to anon key if service key is missing or invalid
const supabaseKey = isValidServiceKey ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY;

const supabase = SUPABASE_URL && supabaseKey
  ? createClient(SUPABASE_URL, supabaseKey)
  : null;

export interface UploadImageResult {
  imageUrl: string;
  fileName: string;
}

/**
 * Upload an image file to Supabase bucket
 * @param file - File buffer to upload
 * @param productId - Product ID to use in the file path
 * @param imageId - Image ID from database
 * @returns Upload result with public URL and file name
 */
export async function uploadImageToSupabase(
  file: Buffer,
  productId: string,
  imageId: string,
  file_base_path: string = "product_images"
): Promise<UploadImageResult> {
  if (!supabase) {
    throw new Error("Supabase client is not initialized");
  }

  // Get file extension from file type or default to jpg
  const fileExtension = getFileExtension(file);
  const fileName = `${productId}_${imageId}.${fileExtension}`;
  const filePath = `${file_base_path}/${fileName}`;

  try {
    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: getMimeType(fileExtension),
        upsert: true,
      });

    if (error) {
      // If we get a JWT error and were using service key, try again with anon key
      if (error.message.includes("JWS") || error.message.includes("JWT")) {
        console.warn("Service role key appears invalid, falling back to anon key");
        if (SUPABASE_ANON_KEY && isValidServiceKey) {
          // Create new client with anon key and retry
          const anonSupabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY);
          const { data: retryData, error: retryError } = await anonSupabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
              contentType: getMimeType(fileExtension),
              upsert: true,
            });
          
          if (retryError) {
            throw new Error(`Failed to upload image: ${retryError.message}`);
          }
          
          // Get public URL with anon client
          const { data: publicUrlData } = anonSupabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

          return {
            imageUrl: publicUrlData.publicUrl,
            fileName: fileName,
          };
        }
      }
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      imageUrl: publicUrlData.publicUrl,
      fileName: fileName,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to upload image: ${errorMessage}`);
  }
}

/**
 * Delete an image from Supabase bucket
 * @param fileName - File name to delete (format: product_id_image_id.extension)
 * @param file_base_path - Base path for the file in the bucket
 */
export async function deleteImageFromSupabase(fileName: string, file_base_path: string = "product_images"): Promise<void> {
  if (!supabase) {
    console.warn("Supabase client is not initialized - cannot delete image");
    return;
  }

  const filePath = `${file_base_path}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error(`Failed to delete image ${fileName}:`, error.message);
    // Don't throw - allow deletion to continue even if file doesn't exist
  }
}

/**
 * Get file extension from buffer
 * @param buffer - File buffer
 * @returns File extension (jpg, png, webp, etc)
 */
function getFileExtension(buffer: Buffer): string {
  // Check for PNG signature
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "png";
  }
  
  // Check for JPEG signature
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  
  // Check for WebP signature
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }
  
  // Default to jpg
  return "jpg";
}

/**
 * Get MIME type for file extension
 * @param extension - File extension
 * @returns MIME type
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  
  return mimeTypes[extension.toLowerCase()] || "image/jpeg";
}
