export class UploadService {
  private readonly apiBaseUrl = "http://127.0.0.1:8000/api";

  async uploadBlob(blob: Blob, tourId: number, crewId: number) {
    const formData = new FormData();

    // Přidání Blobu jako souboru do FormData
    formData.append("file", blob, "example-file.jpg"); // "example-file.jpg" je název souboru, který bude zobrazen na backendu

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/tours/${tourId}/crews/${crewId}/upload-photo`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }
}
