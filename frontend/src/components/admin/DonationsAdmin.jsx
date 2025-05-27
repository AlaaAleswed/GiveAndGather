import React, { useEffect, useState } from "react";
import axios from "axios";

const DonationsAdmin = () => {
  const [donations, setDonations] = useState([]);

  const fetchDonations = async () => {
    try {
      const res = await axios.get("/admin/donations", { withCredentials: true });
      setDonations(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch donations:", err.message);
    }
  };

  const toggleVisibility = async (id) => {
    try {
      await axios.patch(`/admin/donations/${id}/visibility`, {}, { withCredentials: true });
      fetchDonations();
    } catch (err) {
      alert("Failed to toggle visibility");
    }
  };

  const deleteDonation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;
    try {
      await axios.delete(`/admin/donations/${id}`, { withCredentials: true });
      fetchDonations();
    } catch (err) {
      alert("Failed to delete donation");
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return (
    <div>
      <h3 className="mb-3">Manage Donations</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Title</th>
            <th>Kind</th>
            <th>Owner</th>
            <th>Visible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((d) => (
            <tr key={d._id}>
              <td>{d.title}</td>
              <td>{d.kind}</td>
              <td>{d.user?.name || "Unknown"}</td>
              <td>{d.isVisible !== false ? "Yes" : "Hidden"}</td>
              <td>
                <button className="btn btn-sm btn-warning me-1" onClick={() => toggleVisibility(d._id)}>
                  {d.isVisible !== false ? "Hide" : "Show"}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteDonation(d._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DonationsAdmin;
