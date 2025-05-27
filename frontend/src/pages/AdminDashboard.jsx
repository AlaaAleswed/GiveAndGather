import React, { useState } from "react";
import UsersAdmin from "../components/admin/UsersAdmin";
import DonationsAdmin from "../components/admin/DonationsAdmin";
import ReportsAdmin from "../components/admin/ReportsAdmin";
// import SiteSettings from "../components/admin/SiteSettings";
import AdminHome from "../components/admin/AdminHome";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <AdminHome />;
      case "users":
        return <UsersAdmin />;
      case "donations":
        return <DonationsAdmin />;
      case "reports":
        return <ReportsAdmin />;
      case "settings":
        return <SiteSettings />;
      default:
        return <AdminHome />;
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Admin Panel</h1>

      <div className="btn-group mb-4">
        <button
          className={`btn btn-${
            activeTab === "home" ? "primary" : "outline-primary"
          }`}
          onClick={() => setActiveTab("home")}
        >
          Home
        </button>

        <button
          className={`btn btn-${
            activeTab === "users" ? "primary" : "outline-primary"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`btn btn-${
            activeTab === "donations" ? "primary" : "outline-primary"
          }`}
          onClick={() => setActiveTab("donations")}
        >
          Donations
        </button>
        <button
          className={`btn btn-${
            activeTab === "reports" ? "primary" : "outline-primary"
          }`}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
        <button
          className={`btn btn-${
            activeTab === "settings" ? "primary" : "outline-primary"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      <div className="card shadow p-4">{renderTab()}</div>
    </div>
  );
};

export default AdminDashboard;
