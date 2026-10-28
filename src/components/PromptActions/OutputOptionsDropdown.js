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
            bg-ink-50 dark:bg-void-725
            hover:bg-ink-100 dark:hover:bg-void-700
            text-[13px] font-medium text-ink-950 dark:text-white
            transition-colors duration-150 outline-none"
        >
          <MdOutlineAutoAwesome className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
          <span className="hidden sm:inline">Output</span>
          {/* Active count badge — number on sm+, dot on xs */}
          {hasActiveOption && (
            <>
              <span className="sm:hidden w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-500" />
              <span className="hidden sm:flex items-center justify-center w-4 h-4 rounded-full
                bg-brand-600 dark:bg-brand-500
                text-white
                text-[11px] font-bold leading-none">
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
            border border-ink-150 dark:border-void-725
            bg-white dark:bg-void-800
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
                className="flex items-center gap-2 px-2.5 py-[7px] rounded-xl outline-none cursor-pointer
                  text-ink-750 dark:text-ink-300
                  hover:bg-ink-50 dark:hover:bg-void-750
                  transition-colors duration-100"
              >
                <Icon className="w-[14px] h-[14px] flex-shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium leading-snug">{label}</p>
                  <p className="text-[11px] text-ink-400 dark:text-ink-600 leading-snug">
                    {description}
                  </p>
                </div>
                {isActive && (
                  <IoCheckmark className="w-[13px] h-[13px] flex-shrink-0 text-brand-600 dark:text-brand-400" />
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

