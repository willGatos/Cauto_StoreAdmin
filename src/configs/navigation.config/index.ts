import type { NavigationTree } from "@/@types/navigation";
import appsNavigationConfig from "./apps.navigation.config";
import authNavigationConfig from "./auth.navigation.config";
import pagesNavigationConfig from "./pages.navigation.config";

const navigationConfig: NavigationTree[] = [
  ...appsNavigationConfig,
  /* ...pagesNavigationConfig,
    ...authNavigationConfig, */
];

export default navigationConfig;
