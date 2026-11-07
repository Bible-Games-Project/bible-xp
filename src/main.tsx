import "@fontsource-variable/nunito";
import "@fontsource/lilita-one/latin-400.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { preloadAvatars } from "./components/PlayerAvatar";
import { preloadScenes } from "./components/Scene";
import { mountColorPicker } from "./dev/ColorPicker";
import "./theme/tokens.css";
import "./theme/base.css";
import "./theme/components.css";
import "./theme/screens.css";
import "./theme/player.css";
import "./theme/games.css";
import "./theme/mascot.css";

preloadScenes();
preloadAvatars();

// Developer tools: `bun run dev` and `bun run build:devtools` only. Release
// builds (`bun run build`) compile this to `if (false)` and drop the picker.
if (import.meta.env.DEV || import.meta.env.MODE === "devtools") mountColorPicker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
