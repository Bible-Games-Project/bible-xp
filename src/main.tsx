import "@fontsource-variable/nunito";
import "@fontsource/lilita-one/latin-400.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { preloadScenes } from "./components/Scene";
import "./theme/tokens.css";
import "./theme/base.css";
import "./theme/components.css";
import "./theme/screens.css";
import "./theme/games.css";
import "./theme/mascot.css";

preloadScenes();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
