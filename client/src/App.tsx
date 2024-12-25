import { useState } from "react";
import "./App.css";
import Table from "pk-editable-table-component";
import { FileUploader } from "./components/fileUploader";

import { UploadResponse, Record as Rec } from "./api/types/response";
function App() {
  const headers = [
    {
      key: "name",
      type: "text",
      required: true,
      filterDisabled: true,
      sorterDisabled: true,
    },
    {
      key: "score",
      type: "number",
      required: true,
      filterDisabled: true,
      sorterDisabled: true,
    },
  ];
  const [editable, setEditable] = useState<boolean>(false);

  const [data, setData] = useState<Rec[]>([]);

  const handleUploadedResponse = (r: UploadResponse<Rec>) => {
    setData(r.list);
  };

  return (
    <>
      <div>
        <FileUploader onUploadComplete={handleUploadedResponse} />
        <button
          className="control-button"
          onClick={() => setEditable(!editable)}
        >
          {editable ? "STORNO" : "EDIT"}
        </button>
        <Table
          keyVal="id"
          initialData={data}
          headers={headers}
          editable={editable}
          text={{ delete: "SMAZAT", addRow: "PŘIDAT", submit: "ULOŽIT" }}
          actions={{
            create: true,
            edit: true,
            delete: true,
          }}
        />
      </div>
    </>
  );
}

export default App;
