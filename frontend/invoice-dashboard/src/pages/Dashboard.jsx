import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {

  const [stats, setStats] = useState(null);

  useEffect(() => {

    const fetchStats = async () => {

      try {

        const res = await api.get("/stats");

        setStats(res.data);

      } catch (error) {

        console.error("Error fetching stats", error);

      }

    };

    fetchStats();

  }, []);

  if (!stats) {
    return <h2 style={{ padding: "40px" }}>Loading dashboard...</h2>;
  }

  return (

    <div style={{ padding: "40px" }}>

      <h1>Invoice SaaS Dashboard</h1>

      <h3>Total Documents: {stats.total_documents}</h3>

      <h3>Processed: {stats.processed}</h3>

      <h3>Uploaded: {stats.uploaded}</h3>

      <h3>Failed: {stats.failed}</h3>

    </div>

  );

}

export default Dashboard;