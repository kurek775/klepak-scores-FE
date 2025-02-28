import React, { useState } from "react";
import { uploadFile } from "../api/services/uploadService";
import { UploadResponse, Record } from "../api/types/response";
import { Button, Spinner } from "@fluentui/react-components";
type FileUploaderProps = {
  onUploadComplete?: (response: UploadResponse<Record>) => void;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadFile(file);
      console.log("Upload successful:", response);
      if (onUploadComplete) {
        onUploadComplete(response);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}
    >
      <h3>File Uploader</h3>
      <input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? <Spinner size="extra-small" /> : "Upload"}
      </Button>
    </div>
  );
};
