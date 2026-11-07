import { useEffect } from "react";
import { useScrollReset, useRoute } from "./app/router";
import { useApplySettings } from "./app/preferences";
import { useI18n } from "./i18n";
import { music } from "./lib/music";
import { AvatarScreen } from "./screens/AvatarScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { useProgress } from "./progress/store";
import { DailyScreen } from "./screens/DailyScreen";
import { TrainScreen } from "./screens/TrainScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { AboutScreen, MultiplayerScreen, NotFoundScreen, PlusScreen, PrivacyScreen, TermsScreen } from "./screens/InfoScreens";
import { IntroScreen } from "./screens/IntroScreen";
import { BookScreen } from "./screens/BookScreen";
import { CurrentStoryScreen, StoryScreen } from "./screens/StoryScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ReviewPlayScreen, ReviewScreen } from "./screens/ReviewScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

export function App() {
  const route = useRoute();
  const { settings, onboarding } = useProgress();
  const { language } = useI18n();
  useApplySettings(settings, language.code, language.dir);
  // Background music starts with the app and follows the Music setting.
  useEffect(() => music()?.setEnabled(settings.music), [settings.music]);
  useScrollReset(JSON.stringify(route));

  // First-time setup comes before everything else, whatever the link opened.
  if (!onboarding.completedAt) return <OnboardingScreen />;

  switch (route.name) {
    case "home":
      return <HomeScreen />;
    case "path":
      return <CurrentStoryScreen />;
    case "library":
      return <LibraryScreen />;
    case "book":
      return <BookScreen key={route.bookId} bookId={route.bookId} />;
    case "story":
      return <StoryScreen key={route.unitId} unitId={route.unitId} from={route.from} />;
    case "train":
      return <TrainScreen />;
    case "leaderboard":
      return <LeaderboardScreen sample={route.sample} />;
    case "avatar":
      return <AvatarScreen />;
    case "profile":
      return <ProfileScreen />;
    case "settings":
      return <SettingsScreen from={route.from} />;
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
