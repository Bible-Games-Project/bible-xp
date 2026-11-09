import "@fontsource-variable/nunito";
import "@fontsource/lilita-one/latin-400.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { trackAppHeight } from "./app/viewport";
import { preloadAvatars } from "./components/PlayerAvatar";
import { preloadScenes } from "./components/Scene";
import { DEV_BUILD } from "./dev/devMode";
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

// The DEV button (developer mode): developer builds and the preview site only.
// Loaded as a separate chunk, so the published app never downloads it.
if (DEV_BUILD) void import("./dev/DevTools").then((m) => m.mountDevTools());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
