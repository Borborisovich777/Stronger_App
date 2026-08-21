import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import StrongerApp from "./StrongerApp";
import "./globals.css";

const root = document.getElementById("root");

if (!root) throw new Error("Stronger could not find its app root.");

createRoot(root).render(
  <StrictMode>
    <StrongerApp />
  </StrictMode>,
);
