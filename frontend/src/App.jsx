import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CoordinatorOffline from "./pages/CoordinatorOffline";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["admin", "coordinator"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coordinator/offline"
        element={
          <ProtectedRoute roles={["admin", "coordinator"]}>
            <CoordinatorOffline />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
