import { useEffect } from "react";
import useThemeStore, {
  applyTheme,
  getSystemTheme,
  THEME_OPTIONS,
} from "../store/useThemeStore";

function ThemeHandler() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === THEME_OPTIONS.SYSTEM) {
      if (typeof window !== "undefined" && window.matchMedia) {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        applyTheme(getSystemTheme());
        const onChange = () => {
          applyTheme(getSystemTheme());
        };
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
      }
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  return null;
}

export default ThemeHandler;
