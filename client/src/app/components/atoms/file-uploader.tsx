"use client";
import React, { useState } from "react";

const FileUploader: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
      // Zde můžete přidat logiku pro zpracování souboru (např. odeslání na server)
      console.log("Nahraný soubor:", file);
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
