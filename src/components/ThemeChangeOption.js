import { GrSun } from "react-icons/gr";
import { MdDarkMode, MdOutlineDevices } from "react-icons/md";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import useThemeStore, { THEME_OPTIONS } from "../store/useThemeStore";

const themeOptions = [
  THEME_OPTIONS.LIGHT,
  THEME_OPTIONS.DARK,
  THEME_OPTIONS.SYSTEM,
];

const ThemeChangeOption = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const Icons = {
    [THEME_OPTIONS.LIGHT]: <GrSun />,
    [THEME_OPTIONS.DARK]: <MdDarkMode />,
    [THEME_OPTIONS.SYSTEM]: <MdOutlineDevices />,
  };

  const Icon = Icons[theme];

  const currentIndex = themeOptions.indexOf(theme);
  const handlePrev = () => {
    const prevIndex =
      (currentIndex - 1 + themeOptions.length) % themeOptions.length;
    setTheme(themeOptions[prevIndex]);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % themeOptions.length;
    setTheme(themeOptions[nextIndex]);
  };

  return (
    <div className="flex items-center gap-2.5 w-full px-2.5 py-[7px] text-[13px] rounded-xl cursor-pointer transition-colors text-[#333] dark:text-[#ccc] hover:bg-[#f4f4f4] dark:hover:bg-[#363636]">
      <div className="flex-shrink-0 w-[14px] h-[14px] opacity-60 flex items-center justify-center">
        {Icon}
      </div>
      <div className="flex-grow flex items-center justify-between">
        <span>Theme</span>
        <div className="flex items-center gap-1.5 text-[#aaa] dark:text-[#555]">
          <button
            onClick={handlePrev}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8] dark:hover:bg-[#2e2e2e] transition-colors"
          >
            <FaAngleLeft className="w-[10px] h-[10px]" />
          </button>
          <span className="text-[11px] font-medium capitalize w-[38px] text-center text-[#777] dark:text-[#666]">
            {theme}
          </span>
          <button
            onClick={handleNext}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8] dark:hover:bg-[#2e2e2e] transition-colors"
          >
            <FaAngleRight className="w-[10px] h-[10px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeChangeOption;
