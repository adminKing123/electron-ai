import { useMemo } from "react";
import useThemeStore, { THEME_OPTIONS, getSystemTheme } from "../store/useThemeStore";

/**
 * Returns true when the active UI theme resolves to dark mode.
 * Reactive to both explicit theme setting changes and OS-level preference changes.
 */
const useIsDark = () => {
  const theme = useThemeStore((state) => state.theme);
  return useMemo(() => {
    if (theme === THEME_OPTIONS.DARK) return true;
    if (theme === THEME_OPTIONS.LIGHT) return false;
    return getSystemTheme() === THEME_OPTIONS.DARK;
  }, [theme]);
};

export default useIsDark;
