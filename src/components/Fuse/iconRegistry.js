import { SiGmail } from "react-icons/si";

import {
  TbCalendarTime,
  TbMail,
  TbWebhook,
  TbDatabase,
  TbCode,
  TbBolt,
  TbBrandSlack,
  TbCloudUpload,
  TbFilter,
  TbGitMerge,
  TbGitBranch,
  TbBell,
  TbSparkles,
  TbWorldWww,
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
  TbCalendarTime,
  TbMail,
  TbWebhook,
  TbDatabase,
  TbCode,
  TbBolt,
  TbBrandSlack,
  TbCloudUpload,
  TbFilter,
  TbGitMerge,
  TbGitBranch,
  TbBell,
  TbSparkles,
  TbWorldWww,
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
