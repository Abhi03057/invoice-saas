import { useEffect, useState } from "react";
import api from "../api/axios";

function Documents() {

  const [documents, setDocuments] = useState([]);

  useEffect(() => {

    const fetchDocuments = async () => {

      try {

        const res = await api.get("/documents");

        setDocuments(res.data);

      } catch (error) {

        console.error("Error fetching documents", error);

      }

    };

    fetchDocuments();

  }, []);

  return (

    <div style={{ padding: "40px" }}>

      <h1>Documents</h1>

      <table border="1" cellPadding="10">

        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Uploaded</th>
            <th>Processed</th>
          </tr>
        </thead>

        <tbody>

          {documents.map(doc => (

            <tr key={doc.id}>
              <td>{doc.id}</td>
              <td>{doc.status}</td>
              <td>{doc.uploaded_at}</td>
              <td>{doc.processed_at || "Processing..."}</td>
            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default Documents;