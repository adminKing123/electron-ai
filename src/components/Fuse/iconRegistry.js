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
  TbCode,
} from "react-icons/tb";

/**
 * Maps backend-provided icon name strings to their React icon components.
 * Extend this map as new node types are introduced on the backend.
 *
 * The backend sends: { icon: "TbCalendarTime" }
 * The frontend resolves: getNodeIcon("TbCalendarTime") ? <TbCalendarTime />
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
  TbCode,
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
 * Brand and semantic colors per icon key (same in light and dark theme).
 * Brand icons use fixed hex (Simple Icons inherit via currentColor).
 */
const ICON_PRESENTATION = {
  SiGmail: { brandColor: "#EA4335" },
  SiWebex: { brandColor: "#007ACC" },
  SiGooglesheets: { brandColor: "#0F9D58" },
  SiGithub: { brandColor: "#24292f" },
  FaCodePullRequest: { brandColor: "#24292f" },
  TbCalendarTime: { brandColor: "#059669" },
  TbWebhook: { brandColor: "#059669" },
  TbBell: { brandColor: "#7c3aed" },
  TbGitBranch: { brandColor: "#d97706" },
  TbArrowsSplit2: { brandColor: "#7c3aed" },
  /** @deprecated legacy switch node key — same icon as TbArrowsSplit2 */
  TbSwitchHorizontal: { brandColor: "#7c3aed" },
  RiAiGenerate: { brandColor: "#7c3aed" },
  TbSparkles: { brandColor: "#9333ea" },
  TbWorldWww: { brandColor: "#0d9488" },
  TbRepeat: { brandColor: "#7c3aed" },
  TbGitFork: { brandColor: "#8b5cf6" },
  TbGitMerge: { brandColor: "#8b5cf6" },
  VscVariableGroup: { brandColor: "#64748b" },
  TbFileCode: { brandColor: "#0d9488" },
  TbMail: { brandColor: "#7c3aed" },
  TbCode: { brandColor: "#0d9488" },
};

/**
 * @param {string | null | undefined} iconName
 * @returns {{ className?: string, brandColor?: string }}
 */
export const getNodeIconPresentation = (iconName) =>
  (iconName && ICON_PRESENTATION[iconName]) || {
    brandColor: "#64748b",
  };
