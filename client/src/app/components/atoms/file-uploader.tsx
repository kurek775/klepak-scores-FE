"use client";
import { UploadService } from "@/app/api/services";
import React, { useState } from "react";

const FileUploader: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const service = new UploadService();
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
      console.log("Nahraný soubor:", file);
      service.uploadBlob(file as Blob, 1, 1);
    }
  };

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}
    >
      <h3>Nahrát soubor</h3>
      <input type="file" onChange={handleFileUpload} />
      {fileName && (
        <p>
          <strong>Nahraný soubor:</strong> {fileName}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
