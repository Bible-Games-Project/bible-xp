import { useScrollReset, useRoute } from "./app/router";
import { useApplySettings } from "./app/preferences";
import { useI18n } from "./i18n";
import { useProgress } from "./progress/store";
import { DailyScreen } from "./screens/DailyScreen";
import { TrainScreen } from "./screens/TrainScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { AboutScreen, MultiplayerScreen, NotFoundScreen, PlusScreen, PrivacyScreen, TermsScreen } from "./screens/InfoScreens";
import { IntroScreen } from "./screens/IntroScreen";
import { BookScreen } from "./screens/BookScreen";
import { JourneyScreen } from "./screens/JourneyScreen";
import { StoryScreen } from "./screens/StoryScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ReviewPlayScreen, ReviewScreen } from "./screens/ReviewScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

export function App() {
  const route = useRoute();
  const { settings } = useProgress();
  const { language } = useI18n();
  useApplySettings(settings, language.code);
  useScrollReset(JSON.stringify(route));

  switch (route.name) {
    case "home":
      return <HomeScreen />;
    case "path":
      return <JourneyScreen />;
    case "library":
      return <LibraryScreen />;
    case "book":
      return <BookScreen key={route.bookId} bookId={route.bookId} />;
    case "story":
      return <StoryScreen key={route.unitId} unitId={route.unitId} />;
    case "train":
      return <TrainScreen />;
    case "profile":
      return <ProfileScreen />;
    case "settings":
      return <SettingsScreen />;
    case "about":
      return <AboutScreen />;
    case "privacy":
      return <PrivacyScreen />;
    case "terms":
      return <TermsScreen />;
    case "multiplayer":
      return <MultiplayerScreen />;
    case "plus":
      return <PlusScreen />;
    case "review":
      return <ReviewScreen />;
    case "review-play":
      return <ReviewPlayScreen />;
    case "daily":
      return <DailyScreen />;
    case "intro":
      return <IntroScreen key={route.introId} introId={route.introId} />;
    case "play":
      return <PlayScreen key={route.activityId} activityId={route.activityId} from={route.from} />;
    case "not-found":
      return <NotFoundScreen />;
  }
}
