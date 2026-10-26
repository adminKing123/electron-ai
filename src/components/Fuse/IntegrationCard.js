import React, { useState } from "react";
import {
  startGmailAuthAPI,
  startWebexAuthAPI,
  startGoogleSheetsAuthAPI,
  startGithubAuthAPI,
} from "../../apis/fuse/queryFunctions";
import useIntegrationInfoModalStore from "../../store/useIntegrationInfoModalStore";
import IntegrationIconTile from "./IntegrationIconTile";
import { FUSE_LIST_LINK } from "./fuseListingTable";

const AUTH_START_API = {
  gmail: startGmailAuthAPI,
  webex: startWebexAuthAPI,
  google_sheets: startGoogleSheetsAuthAPI,
  github: startGithubAuthAPI,
};

const actionBtn =
  "text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

/** Shared row layout for integration list + loading skeleton. */
const INTEGRATION_ROW_LAYOUT =
  "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-5";

export const INTEGRATION_ROW_SHELL = `${INTEGRATION_ROW_LAYOUT} hover:bg-[#fafbfc] dark:hover:bg-[#1c1c1c] transition-colors`;

export function IntegrationRowSkeleton() {
  return (
    <div className={INTEGRATION_ROW_LAYOUT} aria-hidden>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="skeleton block w-11 h-11 rounded-md shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton block h-[18px] w-40 sm:w-48 rounded-md" />
          <div className="skeleton block h-[15px] w-full max-w-lg rounded-md" />
        </div>
      </div>
      <div className="pl-[3.75rem] sm:pl-0 shrink-0">
        <div className="skeleton block h-9 w-[5.5rem] rounded-lg" />
      </div>
    </div>
  );
}

/** Placeholder rows while integrations load (matches typical list size, not every slot). */
export const INTEGRATION_SKELETON_ROW_COUNT = 3;

const IntegrationCard = ({ integration, onRevokeClick }) => {
  const [configuring, setConfiguring] = useState(false);
  const openInfoModal = useIntegrationInfoModalStore((state) => state.openModal);

  const handleConfigure = async () => {
    const startAuth = AUTH_START_API[integration.id];
    if (!startAuth) return;

    setConfiguring(true);
    try {
      const response = await startAuth();
      if (response?.auth_url) {
        window.location.href = response.auth_url;
      }
    } catch (error) {
      console.error(`Failed to start ${integration.name} auth`, error);
    } finally {
      setConfiguring(false);
    }
  };

  const connected = integration.configured;

  return (
    <div className={INTEGRATION_ROW_SHELL}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <IntegrationIconTile iconName={integration.icon} tileClassName="w-11 h-11" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-[#111] dark:text-white leading-snug truncate">
            {integration.name}
          </h3>
          <p className="text-[13px] text-[#6b7280] dark:text-[#888] mt-1 line-clamp-2 sm:line-clamp-1 leading-relaxed">
            {integration.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-[3.75rem] sm:pl-0 shrink-0">
        {connected ? (
          <>
            <button
              type="button"
              onClick={() => openInfoModal(integration.id)}
              className={`${actionBtn} text-[#374151] dark:text-[#ccc] hover:bg-[#eef0f2] dark:hover:bg-[#2a2a2a]`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={onRevokeClick}
              className={`${actionBtn} text-red-600 dark:text-red-400 hover:bg-red-500/8 dark:hover:bg-red-500/10`}
            >
              Revoke
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleConfigure}
            disabled={configuring}
            className={`${FUSE_LIST_LINK} text-[13px] font-semibold disabled:opacity-50`}
          >
            {configuring ? "Connecting…" : "Connect"}
          </button>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;
