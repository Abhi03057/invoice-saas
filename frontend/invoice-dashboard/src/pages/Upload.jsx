import { useState } from "react";
import api from "../api/axios";

function Upload() {

  const [files, setFiles] = useState([]);

  const handleUpload = async () => {

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {

      await api.post("/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Documents uploaded successfully");

    } catch (error) {

      console.error(error);
      alert("Upload failed");

    }

  };

  return (

    <div style={{ padding: "40px" }}>

      <h1>Upload Invoices</h1>

      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />

      <br /><br />

      <button onClick={handleUpload}>
        Upload
      </button>

    </div>

  );

}

export default Upload;