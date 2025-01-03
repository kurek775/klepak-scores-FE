import { UploadResponse, Record } from "../types/response";

export async function uploadFile(file: File): Promise<UploadResponse<Record>> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      "http://localhost:8000/api/crews/2/upload-photo",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}
