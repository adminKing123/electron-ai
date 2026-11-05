import { SiGmail, SiWebex, SiGithub, SiGooglesheets } from "react-icons/si";
import { FaCodePullRequest } from "react-icons/fa6";
import { RiAiGenerate } from "react-icons/ri";
import { VscVariableGroup } from "react-icons/vsc";

import {
  TbCalendarTime,
  TbWebhook,
  TbGitBranch,
  TbArrowsSplit2,
  TbBell,
  TbSparkles,
  TbWorldWww,
  TbGitFork,
  TbGitMerge,
  TbRepeat,
  TbFileCode,
  TbMail,
} from "react-icons/tb";

/**
 * Maps backend-provided icon name strings to their React icon components.
 * Extend this map as new node types are introduced on the backend.
 *
 * The backend sends: { icon: "TbCalendarTime" }
 * The frontend resolves: getNodeIcon("TbCalendarTime") â†' <TbCalendarTime />
 */
export const ICON_REGISTRY = {
  SiGmail,
  SiWebex,
  SiGithub,
  SiGooglesheets,
  FaCodePullRequest,
  RiAiGenerate,
  VscVariableGroup,
  TbCalendarTime,
  TbWebhook,
  TbGitBranch,
  TbArrowsSplit2,
  TbSwitchHorizontal: TbArrowsSplit2,
  TbBell,
  TbSparkles,
  TbWorldWww,
  TbGitFork,
  TbGitMerge,
  TbRepeat,
  TbFileCode,
  TbMail,
};

/**
 * Resolve a backend icon name string to its React icon component.
 * Returns null if the icon name is not registered.
 *
 * @param {string | null | undefined} iconName
 * @returns {React.ComponentType | null}
 */
export const getNodeIcon = (iconName) =>
  (iconName && ICON_REGISTRY[iconName]) || null;

/**
 * Brand and semantic colors per icon key.
 * Brand icons use fixed hex (Simple Icons inherit via currentColor).
 * Others use Tailwind text-* classes matching canvas node styling.
 */
const ICON_PRESENTATION = {
  SiGmail: { brandColor: "#EA4335" },
  SiWebex: { brandColor: "#007ACC" },
  SiGooglesheets: { brandColor: "#0F9D58" },
  SiGithub: { className: "text-[#24292f] dark:text-[#e6edf3]" },
  FaCodePullRequest: { className: "text-[#24292f] dark:text-[#e6edf3]" },
  TbCalendarTime: { className: "text-[#059669] dark:text-[#34d399]" },
  TbWebhook: { className: "text-[#059669] dark:text-[#34d399]" },
  TbBell: { className: "text-brand-600 dark:text-brand-400" },
  TbGitBranch: { className: "text-[#d97706] dark:text-[#94a3b8]" },
  TbArrowsSplit2: { className: "text-[#7c3aed] dark:text-[#94a3b8]" },
  /** @deprecated legacy switch node key â€” same icon as TbArrowsSplit2 */
  TbSwitchHorizontal: { className: "text-[#7c3aed] dark:text-[#94a3b8]" },
  RiAiGenerate: { className: "text-brand-600 dark:text-brand-400" },
  TbSparkles: { className: "text-[#9333ea] dark:text-[#c084fc]" },
  TbWorldWww: { className: "text-[#0d9488] dark:text-[#2dd4bf]" },
  TbRepeat: { className: "text-brand-600 dark:text-brand-400" },
  TbGitFork: { className: "text-brand-500 dark:text-brand-400" },
  TbGitMerge: { className: "text-brand-500 dark:text-brand-400" },
  VscVariableGroup: { className: "text-[#64748b] dark:text-[#94a3b8]" },
  TbFileCode: { className: "text-[#0d9488] dark:text-[#2dd4bf]" },
  TbMail: { className: "text-brand-600 dark:text-brand-400" },
};

/**
 * @param {string | null | undefined} iconName
 * @returns {{ className?: string, brandColor?: string }}
 */
export const getNodeIconPresentation = (iconName) =>
  (iconName && ICON_PRESENTATION[iconName]) || {
    className: "text-ink-650 dark:text-ink-400",
  };
