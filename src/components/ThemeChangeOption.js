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
    <li>
      <div className="flex text-[#000000] dark:text-[#C8C8C8] items-center gap-2 w-full hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] rounded-lg px-2 py-1 text-[14px] h-8">
        <div className="flex-shrink-0">{Icon}</div>
        <div className="flex-grow flex items-center justify-between">
          <div>Theme</div>
          <div className="flex items-center gap-2">
            <div className="w-[14px] h-[14px]">
              <button onClick={handlePrev}>
                <FaAngleLeft />
              </button>
            </div>
            <div className="capitalize">{theme}</div>
            <div className="w-[14px] h-[14px]">
              <button onClick={handleNext}>
                <FaAngleRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default ThemeChangeOption;
