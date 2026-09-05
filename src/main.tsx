import { BrowserRouter } from "react-router-dom";
import { NavigationEffects } from "./navigation";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App.tsx";
import "./index.css";

const app = (
  <StrictMode>
    <MotionConfig reducedMotion="user"><BrowserRouter><NavigationEffects/><App /></BrowserRouter></MotionConfig>
  </StrictMode>
);
const root = document.getElementById("root")!;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
