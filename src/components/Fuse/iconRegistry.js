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
 * The frontend resolves: getNodeIcon("TbCalendarTime") → <TbCalendarTime />
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
  TbBell: { className: "text-[#2563eb] dark:text-[#60a5fa]" },
  TbGitBranch: { className: "text-[#d97706] dark:text-[#f59e0b]" },
  TbArrowsSplit2: { className: "text-[#7c3aed] dark:text-[#a78bfa]" },
  /** @deprecated legacy switch node key — same icon as TbArrowsSplit2 */
  TbSwitchHorizontal: { className: "text-[#7c3aed] dark:text-[#a78bfa]" },
  RiAiGenerate: { className: "text-[#2563eb] dark:text-[#60a5fa]" },
  TbSparkles: { className: "text-[#9333ea] dark:text-[#c084fc]" },
  TbWorldWww: { className: "text-[#0d9488] dark:text-[#2dd4bf]" },
  TbRepeat: { className: "text-[#2563eb] dark:text-[#60a5fa]" },
  TbGitFork: { className: "text-[#6366f1] dark:text-[#818cf8]" },
  TbGitMerge: { className: "text-[#6366f1] dark:text-[#818cf8]" },
  VscVariableGroup: { className: "text-[#64748b] dark:text-[#94a3b8]" },
  TbFileCode: { className: "text-[#0d9488] dark:text-[#2dd4bf]" },
  TbMail: { className: "text-[#2563eb] dark:text-[#60a5fa]" },
};

/**
 * @param {string | null | undefined} iconName
 * @returns {{ className?: string, brandColor?: string }}
 */
export const getNodeIconPresentation = (iconName) =>
  (iconName && ICON_PRESENTATION[iconName]) || {
    className: "text-[#555] dark:text-[#aaa]",
  };
