import "@fontsource-variable/nunito";
import "@fontsource/lilita-one/latin-400.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { trackAppHeight } from "./app/viewport";
import { preloadAvatars } from "./components/PlayerAvatar";
import { preloadScenes } from "./components/Scene";
import { mountDevTools } from "./dev/DevTools";
import { STARTING_CHARACTER } from "./progress/characters";
import { getProgress } from "./progress/store";
import "./theme/tokens.css";
import "./theme/base.css";
import "./theme/components.css";
import "./theme/screens.css";
import "./theme/player.css";
import "./theme/games.css";
import "./theme/mascot.css";

trackAppHeight();
preloadScenes();
preloadAvatars([...Object.values(STARTING_CHARACTER), getProgress().profile.look?.character ?? ""]);

// The DEV button (developer mode): `bun run dev` and `bun run build:devtools`
// only. Release builds (`bun run build`) compile this to `if (false)` and drop it.
if (import.meta.env.DEV || import.meta.env.MODE === "devtools") mountDevTools();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
