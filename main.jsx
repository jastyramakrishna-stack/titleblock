import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// App.jsx was originally built as a Claude.ai artifact, where `window.storage`
// is provided by the platform. Outside that environment there is no such API,
// so this shim re-implements the same get/set/delete/list contract on top of
// the browser's localStorage. Data is per-browser, not shared across users —
// swap this out for a real backend/API if you need multi-user persistence.
window.storage = {
  async get(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return { key, value: raw };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    const existed = localStorage.getItem(key) !== null;
    localStorage.removeItem(key);
    return { key, deleted: existed };
  },
  async list(prefix = "") {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    return { keys, prefix };
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
