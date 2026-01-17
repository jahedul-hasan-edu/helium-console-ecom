Given the following table definition:
```sql
create table product_images (
id uuid primary key default gen_random_uuid(),
product_id uuid references products(id),
image_url text,
created_by uuid null,
updated_by uuid null,
created_on timestamptz null,
updated_on timestamptz null,
user_ip inet null
);
```
Please perform the following tasks:
1. Create the schema, service, and repository for managing the `product_images` table. A controller is NOT required.
2. Users are able to upload multiple images (with a maximum file size of 1MB each) when creating or updating a product. These images should be uploaded within the product create/update service method and stored in our Supabase bucket named `helium-ecom-bucket`, which is public. The Supabase URL and key are provided in the development and production environments.
3. After uploading, get the public URL of each image and save it into the `product_images` table. The `image_url` format should be: `product_id_product_images_id.<extension>` (where extension can be `.jpg`, `.png`, `.webp`, etc.).
4. When editing a product, users can add or remove images using a modal that supports drag-and-drop file uploading functionality.
5. When a product is deleted, all associated product images (linked by `product_id`) must also be deleted from both the database and the Supabase bucket.






