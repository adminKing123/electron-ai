import { SiGmail, SiWebex, SiGithub, SiGooglesheets } from "react-icons/si";
import { FaCodePullRequest } from "react-icons/fa6";
import { RiAiGenerate } from "react-icons/ri";
import { VscVariableGroup } from "react-icons/vsc";

import {
  TbCalendarTime,
  TbWebhook,
  TbGitBranch,
  TbBell,
  TbSparkles,
  TbWorldWww,
  TbGitFork,
  TbGitMerge,
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
  TbBell,
  TbSparkles,
  TbWorldWww,
  TbGitFork,
  TbGitMerge,
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
