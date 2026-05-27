import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TbFileCode, TbChartBar } from "react-icons/tb";
import { SiTicktick } from "react-icons/si";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { useOutputOptionsStore } from "../../store/usePromptStores";

/**
 * Dropdown button that exposes output-format toggles:
 * - Generate HTML  – instructs the AI to produce an HTML response
 * - Generate Charts – instructs the AI to produce chart outputs
 *
 * Both options are independent toggles backed by `useOutputOptionsStore`.
 */
const OUTPUT_OPTIONS = [
  {
    key: "generateHtml",
    label: "HTML Preview",
    Icon: TbFileCode,
  },
  {
    key: "generateCharts",
    label: "Chart View",
    Icon: TbChartBar,
  },
];

const OutputOptionsDropdown = () => {
  const generateHtml = useOutputOptionsStore((state) => state.generateHtml);
  const setGenerateHtml = useOutputOptionsStore((state) => state.setGenerateHtml);
  const generateCharts = useOutputOptionsStore((state) => state.generateCharts);
  const setGenerateCharts = useOutputOptionsStore((state) => state.setGenerateCharts);

  const values = { generateHtml, generateCharts };
  const setters = { generateHtml: setGenerateHtml, generateCharts: setGenerateCharts };

  const hasActiveOption = generateHtml || generateCharts;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          title="Output options"
          className={`border ${
            hasActiveOption
              ? "border-blue-400 dark:border-green-400"
              : "dark:border-[#FAFAFA]"
          } bg-[#ffffff] dark:bg-[#2F2F2F] p-2 rounded-full flex items-center group`}
        >
          <MdOutlineAutoAwesome
            className={`${
              hasActiveOption
                ? "fill-blue-400 dark:fill-green-400"
                : "fill-black dark:fill-white"
            }`}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="p-2 min-w-[200px] rounded-xl border border-[#E1E1E1] dark:border-[#444444] bg-[#FFFFFF] dark:bg-[#2F2F2F] cursor-pointer z-10 shadow-lg"
          sideOffset={5}
        >
          {OUTPUT_OPTIONS.map(({ key, label, Icon }) => {
            const isActive = values[key];
            return (
              <DropdownMenu.Item
                key={key}
                onSelect={(e) => {
                  e.preventDefault();
                  setters[key](!isActive);
                }}
                className="px-3 py-2.5 text-sm rounded-xl outline-none flex items-center justify-between gap-3 hover:bg-[#F5F5F5] dark:hover:bg-[#444444]"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive
                        ? "text-blue-400 dark:text-green-400"
                        : "text-black dark:text-white"
                    }`}
                  />
                  <span
                    className={`${
                      isActive
                        ? "text-blue-400 dark:text-green-400"
                        : "text-black dark:text-white"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {isActive && (
                  <SiTicktick className="w-3 h-3 fill-blue-400 dark:fill-green-400 flex-shrink-0" />
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default OutputOptionsDropdown;
