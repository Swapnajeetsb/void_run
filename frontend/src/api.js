import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("voidrun_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { API };
