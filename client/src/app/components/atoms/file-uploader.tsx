"use client";
import { UploadService } from "@/app/api/services";
import React, { useState } from "react";

const FileUploader: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [res,setResp]=useState<any | null>(null);
  const service = new UploadService();
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
      console.log("Nahraný soubor:", file);
      const r = await service.uploadBlob(file as Blob, 1, 1);
      setResp(r);
    }
  };

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}
    >
      <h3>Nahrát soubor</h3>
      <div>{res}</div>
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
