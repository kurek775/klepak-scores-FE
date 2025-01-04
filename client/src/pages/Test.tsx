import { useState } from "react";
import Table from "pk-editable-table-component";
import { FileUploader } from "../components/fileUploader";
import { UploadResponse, Record as Rec } from "../api/types/response";
function TestPage() {
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
  const [editable, setEditable] = useState<boolean>(false);

  const [data, setData] = useState<Rec[]>([]);

  const handleUploadedResponse = (r: UploadResponse<Rec>) => {
    setData(r.list);
  };

  const handleSubmit = (data: any) => {
    console.log(data);
  }

  return (
    <>
      <div>
        <FileUploader onUploadComplete={handleUploadedResponse} />
        {!editable && Boolean(data.length)  && <button
          className="control-button"
          onClick={() => setEditable(true)}
        >
          Editovat
        </button>}
        {Boolean(data.length) && <Table
          keyVal="id"
          initialData={data}
          onSubmit={handleSubmit}
          headers={headers}
          editable={editable}
          text={{ delete: "SMAZAT", addRow: "PŘIDAT", submit: "ULOŽIT" }}
          actions={{
            create: false,
            edit: true,
            delete: false,
          }}
        />}
    
      </div>
    </>
  );
}

export default TestPage;
