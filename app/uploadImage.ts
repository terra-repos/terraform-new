"use server";

import { Storage } from "@google-cloud/storage";
import { createClient } from "@/lib/supabase/server";

let storageClient: Storage | null = null;

async function getStorageClient(): Promise<Storage> {
  if (storageClient) return storageClient;

  const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON!);
  const projectId = credentials.project_id;

  if (!credentials || !projectId) {
    throw new Error("GCP credentials not configured");
  }

  storageClient = new Storage({
    projectId,
    credentials,
  });

  return storageClient;
}

export async function uploadImage(
  file: File,
  folder: string = "order-attachments"
): Promise<string> {
  //const supabase = await createClient();

  //   // Check authentication
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();
  //   if (!user) throw new Error("Unauthorized");

  const bucketName = process.env.GOOGLE_CLOUD_BUCKET;

  try {
    const storage = await getStorageClient();
    const bucket = storage.bucket(bucketName!);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to GCS
    const blob = bucket.file(fileName);
    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
        },
      },
      // Don't set public: true as bucket has uniform access control
      // Files will be public through bucket IAM settings
    });

    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL!;

    // Get public URL - CDN serves files directly without bucket name in path
    const publicUrl = `${imageBaseUrl}/${fileName}`;

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

export async function uploadMultipleImages(
  files: File[],
  folder: string = "order-attachments"
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const supabase = await createClient();

  const bucketName = process.env.GOOGLE_CLOUD_BUCKET!;

  //   // Check authentication
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();
  //   if (!user) throw new Error("Unauthorized");

  try {
    const storage = await getStorageClient();
    const bucket = storage.bucket(bucketName);

    // Extract file path from URL
    const urlPattern = `https://storage.googleapis.com/${bucketName}/`;
    if (!imageUrl.startsWith(urlPattern)) {
      throw new Error("Invalid image URL");
    }

    const filePath = imageUrl.replace(urlPattern, "");

    // Delete from GCS
    await bucket.file(filePath).delete();
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
}

export async function getSignedUrl(
  fileName: string,
  expiresInMinutes: number = 60
): Promise<string> {
  const supabase = await createClient();

  const bucketName = process.env.GOOGLE_CLOUD_BUCKET!;

  // Check authentication
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();
  //   if (!user) throw new Error("Unauthorized");

  try {
    const storage = await getStorageClient();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
}

export async function getSignedUrlForLargeFile(
  fileName: string,
  contentType: string,
  fileSize: number
): Promise<{ uploadUrl: string; publicUrl: string }> {
  console.log("Getting signed URL for large file:", { fileName, fileSize });

  try {
    const storage = await getStorageClient();
    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET!);

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    const gcsFileName = `order-attachments/${timestamp}-${randomString}.${fileExtension}`;

    const file = bucket.file(gcsFileName);

    // Use simple PUT signed URL for large files
    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours for large files
      contentType: contentType,
      extensionHeaders: {
        "content-length": fileSize.toString(),
      },
    });

    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL!;
    const publicUrl = `${imageBaseUrl}/${gcsFileName}`;

    return { uploadUrl, publicUrl };
  } catch (error) {
    console.error("Error generating signed URL for large file:", error);
    throw error;
  }
}
