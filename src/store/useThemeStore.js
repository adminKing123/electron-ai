import { create } from "zustand";

export const THEME_OPTIONS = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

export const getSystemTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEME_OPTIONS.DARK
      : THEME_OPTIONS.LIGHT;
  }
  return THEME_OPTIONS.LIGHT;
};

export const getInitialTheme = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const localStorageTheme = localStorage.getItem("theme");
    if ([THEME_OPTIONS.DARK, THEME_OPTIONS.LIGHT].includes(localStorageTheme)) {
      return localStorageTheme;
    }
  }
  return THEME_OPTIONS.SYSTEM;
};

export const changeMetaTheme = (theme) => {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  themeColorMeta?.setAttribute(
    "content",
    theme === THEME_OPTIONS.DARK ? "#212121" : "#ffffff"
  );
  const msthemeColorMeta = document.querySelector(
    'meta[name="msapplication-navbutton-color"]'
  );
  msthemeColorMeta?.setAttribute(
    "content",
    theme === THEME_OPTIONS.DARK ? "#212121" : "#ffffff"
  );
};

export const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === THEME_OPTIONS.DARK) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  changeMetaTheme(theme);
};

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (newTheme) => {
    set({ theme: newTheme });
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("theme", newTheme);
    }
  },
}));

export default useThemeStore;
