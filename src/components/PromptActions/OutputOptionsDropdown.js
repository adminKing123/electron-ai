import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TbFileCode, TbChartBar } from "react-icons/tb";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { useOutputOptionsStore } from "../../store/usePromptStores";

/**
 * Dropdown button that exposes output-format toggles:
 * - HTML Preview  – AI produces a self-contained HTML file rendered in-app
 * - Chart View    – AI produces Chart.js-compatible JSON rendered as a chart
 *
 * Both options are independent toggles backed by `useOutputOptionsStore`.
 */
const OUTPUT_OPTIONS = [
  {
    key: "generateHtml",
    label: "HTML Preview",
    description: "Renders output as a live HTML page",
    Icon: TbFileCode,
  },
  {
    key: "generateCharts",
    label: "Chart View",
    description: "Renders output as an interactive chart",
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

  const activeCount = [generateHtml, generateCharts].filter(Boolean).length;
  const hasActiveOption = activeCount > 0;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          title="Output options"
          className="relative flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded-full
            bg-[#f4f4f4] dark:bg-[#3a3a3a]
            hover:bg-[#e9e9e9] dark:hover:bg-[#444444]
            text-[13px] font-medium text-black dark:text-white
            transition-colors duration-150 outline-none"
        >
          <MdOutlineAutoAwesome className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
          <span className="hidden sm:inline">Output</span>
          {/* Active count badge — number on sm+, dot on xs */}
          {hasActiveOption && (
            <>
              <span className="sm:hidden w-2 h-2 rounded-full bg-[#111] dark:bg-white" />
              <span className="hidden sm:flex items-center justify-center w-4 h-4 rounded-full
                bg-[#111] dark:bg-white
                text-white dark:text-black
                text-[10px] font-bold leading-none">
                {activeCount}
              </span>
            </>
          )}
          <IoChevronDown className="hidden sm:block w-3 h-3 flex-shrink-0 opacity-50" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="p-1.5 min-w-[230px] rounded-2xl
            border border-[#e5e5e5] dark:border-[#3a3a3a]
            bg-white dark:bg-[#2a2a2a]
            shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
            z-10"
          sideOffset={8}
        >
          {OUTPUT_OPTIONS.map(({ key, label, description, Icon }) => {
            const isActive = values[key];
            return (
              <DropdownMenu.Item
                key={key}
                onSelect={(e) => {
                  e.preventDefault();
                  setters[key](!isActive);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl outline-none cursor-pointer
                  text-[#111] dark:text-[#f0f0f0]
                  hover:bg-[#f4f4f4] dark:hover:bg-[#363636]
                  transition-colors duration-100"
              >
                <Icon className="w-4 h-4 flex-shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{label}</p>
                  <p className="text-[11px] text-[#888] dark:text-[#666] mt-0.5">
                    {description}
                  </p>
                </div>
                {isActive && (
                  <IoCheckmark className="w-4 h-4 flex-shrink-0 text-[#111] dark:text-[#f0f0f0] opacity-80" />
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

