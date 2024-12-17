export class UploadService {
  private readonly apiBaseUrl =  "http://127.0.0.1:8000/api";

  async uploadBlob(blob: Blob, tourId: number, crewId: number):Promise<any> {
    const formData = new FormData();
    formData.append("file", blob, "example-file.jpg");

    const response = await fetch(
      `${this.apiBaseUrl}/tours/${tourId}/crews/${crewId}/upload-photo`,
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const res = await response.json();
    return res.message.sport as any;
  }
}
