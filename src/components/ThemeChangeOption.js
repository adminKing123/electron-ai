import { GrSun } from "react-icons/gr";
import { MdDarkMode, MdOutlineDevices } from "react-icons/md";
import useThemeStore, { THEME_OPTIONS } from "../store/useThemeStore";

const themeOptions = [
  THEME_OPTIONS.LIGHT,
  THEME_OPTIONS.DARK,
  THEME_OPTIONS.SYSTEM,
];

/** Segmented 3-icon toggle — reused in both standalone (header) and menu-item (sidebar) contexts. */
const ThemeToggle = ({ theme, setTheme, Icons }) => (
  <div className="flex items-center gap-0.5 bg-[#e8e8e8] dark:bg-[#2a2a2a] rounded-lg p-0.5">
    {themeOptions.map((option) => {
      const isActive = theme === option;
      return (
        <button
          key={option}
          onClick={() => setTheme(option)}
          title={option.charAt(0).toUpperCase() + option.slice(1)}
          className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
            isActive
              ? "bg-white dark:bg-[#1e1e1e] text-[#111] dark:text-white shadow-sm"
              : "text-[#aaa] dark:text-[#555] hover:text-[#555] dark:hover:text-[#aaa]"
          }`}
        >
          <span className="w-[13px] h-[13px] flex items-center justify-center">
            {Icons[option]}
          </span>
        </button>
      );
    })}
  </div>
);

/**
 * `standalone` — renders only the segmented toggle (for headers, toolbars).
 * Default — renders a full sidebar menu-item row with a "Theme" label.
 */
const ThemeChangeOption = ({ standalone = false }) => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const Icons = {
    [THEME_OPTIONS.LIGHT]: <GrSun />,
    [THEME_OPTIONS.DARK]: <MdDarkMode />,
    [THEME_OPTIONS.SYSTEM]: <MdOutlineDevices />,
  };

  if (standalone) {
    return <ThemeToggle theme={theme} setTheme={setTheme} Icons={Icons} />;
  }

  return (
    <div className="flex items-center gap-2.5 w-full px-2.5 py-[7px] text-[13px] rounded-xl text-[#333] dark:text-[#ccc] hover:bg-[#f4f4f4] dark:hover:bg-[#363636] transition-colors">
      <div className="flex-grow flex items-center justify-between">
        <span>Theme</span>
        <ThemeToggle theme={theme} setTheme={setTheme} Icons={Icons} />
      </div>
    </div>
  );
};

export default ThemeChangeOption;
