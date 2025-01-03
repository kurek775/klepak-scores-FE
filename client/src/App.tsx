import { useState } from "react";
import "./App.css";
import Table from "pk-editable-table-component";
import { FileUploader } from "./components/fileUploader";

import { UploadResponse, Record as Rec } from "./api/types/response";
function App() {
  const headers = [
    {
      columnLabel: "Jméno",
      key: "name",
      type: "text",
      disabled: true,
      required: true,
      filterDisabled: true,
      sorterDisabled: true,
    },
    {
      columnLabel: "Výsledek",
      key: "score",
      type: "number",
      required: true,
      filterDisabled: true,
      sorterDisabled: true,
    },
  ];
  const [editable, setEditable] = useState<boolean>(true);

  const [data, setData] = useState<Rec[]>([]);

  const handleUploadedResponse = (r: UploadResponse<Rec>) => {
    setData(r.list);
  };

  return (
    <>
      <div>
        <FileUploader onUploadComplete={handleUploadedResponse} />
        {Boolean(data.length) && <Table
          keyVal="id"
          initialData={data}
          headers={headers}
          editable={editable}
          text={{ delete: "SMAZAT", addRow: "PŘIDAT", submit: "ULOŽIT" }}
          actions={{
            create: false,
            edit: true,
            delete: false,
          }}
        />}
        {editable && Boolean(data.length)  && <button
          className="control-button"
          onClick={() => setEditable(!editable)}
        >
          Uložit
        </button>}
      </div>
    </>
  );
}

export default App;
