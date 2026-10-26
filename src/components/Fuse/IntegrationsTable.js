import React, { useState } from "react";
import { TbTrash } from "react-icons/tb";
import {
  startGmailAuthAPI,
  startWebexAuthAPI,
  startGoogleSheetsAuthAPI,
  startGithubAuthAPI,
} from "../../apis/fuse/queryFunctions";
import useIntegrationInfoModalStore from "../../store/useIntegrationInfoModalStore";
import IntegrationIconTile from "./IntegrationIconTile";
import {
  FUSE_LIST_TABLE_WRAP,
  FUSE_LIST_TH,
  FUSE_LIST_TD,
  FUSE_LIST_ROW,
  FUSE_LIST_LINK,
  FuseListingStatusDot,
  FuseListingViewLink,
  FuseListingTableFooter,
  FuseListingTableHead,
} from "./fuseListingTable";

const AUTH_START_API = {
  gmail: startGmailAuthAPI,
  webex: startWebexAuthAPI,
  google_sheets: startGoogleSheetsAuthAPI,
  github: startGithubAuthAPI,
};

const DELETE_CLS =
  "w-8 h-8 flex items-center justify-center rounded-lg text-[#bbb] dark:text-[#555] transition-colors duration-150 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/8 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed";

function useIntegrationActions(integration) {
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

  const handleView = () => {
    if (integration.configured) {
      openInfoModal(integration.id);
    } else {
      handleConfigure();
    }
  };

  return { configuring, handleConfigure, handleView };
}

const IntegrationListItem = ({ integration, onRevokeClick, isLast }) => {
  const { configuring, handleView } = useIntegrationActions(integration);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5
        ${!isLast ? "border-b border-[#eef0f2] dark:border-[#252525]" : ""}`}
    >
      <IntegrationIconTile iconName={integration.icon} tileClassName="w-9 h-9" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#111] dark:text-white truncate">
          {integration.name}
        </p>
        <p className="text-[12px] text-[#6b7280] dark:text-[#888] mt-0.5 line-clamp-2">
          {integration.description}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <FuseListingStatusDot status={integration.configured ? "active" : "inactive"} />
          <span className="text-[11px] text-[#9ca3af] dark:text-[#666]">
            {integration.configured ? "Connected" : "Not connected"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <FuseListingViewLink
          onClick={handleView}
          disabled={configuring}
        >
          {integration.configured ? "View" : configuring ? "…" : "Configure"}
        </FuseListingViewLink>
        {integration.configured && (
          <button
            type="button"
            onClick={() => onRevokeClick(integration)}
            title="Revoke access"
            className={DELETE_CLS}
          >
            <TbTrash className="w-[15px] h-[15px]" />
          </button>
        )}
      </div>
    </div>
  );
};

const IntegrationRow = ({ integration, onRevokeClick }) => {
  const { configuring, handleView } = useIntegrationActions(integration);

  return (
    <tr className={FUSE_LIST_ROW}>
      <td className={FUSE_LIST_TD}>
        <div className="flex items-center gap-3 min-w-0">
          <IntegrationIconTile iconName={integration.icon} tileClassName="w-8 h-8" />
          <button
            type="button"
            className={`${FUSE_LIST_LINK} font-semibold text-left truncate max-w-[180px]`}
            onClick={handleView}
            disabled={configuring}
          >
            {integration.name}
          </button>
        </div>
      </td>
      <td className={`${FUSE_LIST_TD} max-w-[320px] hidden sm:table-cell`}>
        <span
          className="font-semibold text-[#111] dark:text-white truncate block"
          title={integration.description}
        >
          {integration.description}
        </span>
      </td>
      <td className={`${FUSE_LIST_TD} text-[#6b7280] dark:text-[#888] hidden md:table-cell`}>
        {integration.configured ? "Connected" : "—"}
      </td>
      <td className={`${FUSE_LIST_TD} text-right`}>
        <div className="flex justify-end">
          <FuseListingStatusDot status={integration.configured ? "active" : "inactive"} />
        </div>
      </td>
      <td className={`${FUSE_LIST_TD} text-right`}>
        <div className="flex items-center justify-end gap-2">
          <FuseListingViewLink onClick={handleView} disabled={configuring}>
            {integration.configured ? "View" : configuring ? "…" : "Configure"}
          </FuseListingViewLink>
          {integration.configured && (
            <button
              type="button"
              onClick={() => onRevokeClick(integration)}
              title="Revoke access"
              className={DELETE_CLS}
            >
              <TbTrash className="w-[15px] h-[15px]" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const IntegrationsTableSkeleton = ({ count = 4 }) => (
  <div className={FUSE_LIST_TABLE_WRAP}>
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <FuseListingTableHead>
          <th className={FUSE_LIST_TH}>Name</th>
          <th className={`${FUSE_LIST_TH} hidden sm:table-cell`}>Description</th>
          <th className={`${FUSE_LIST_TH} hidden md:table-cell`}>Account</th>
          <th className={`${FUSE_LIST_TH} text-right`}>Status</th>
          <th className={`${FUSE_LIST_TH} text-right w-[140px]`} />
        </FuseListingTableHead>
        <tbody>
          {[...Array(count)].map((_, i) => (
            <tr key={i} className={FUSE_LIST_ROW}>
              <td className={FUSE_LIST_TD}>
                <div className="flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="skeleton h-3.5 w-28 rounded-md" />
                </div>
              </td>
              <td className={`${FUSE_LIST_TD} hidden sm:table-cell`}>
                <div className="skeleton h-3 w-full max-w-xs rounded-md" />
              </td>
              <td className={`${FUSE_LIST_TD} hidden md:table-cell`}>
                <div className="skeleton h-3 w-20 rounded-md" />
              </td>
              <td className={`${FUSE_LIST_TD} text-right`}>
                <div className="skeleton h-2.5 w-2.5 rounded-full ml-auto" />
              </td>
              <td className={`${FUSE_LIST_TD} text-right`}>
                <div className="flex justify-end gap-2">
                  <div className="skeleton h-3 w-14 rounded-md" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="md:hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 px-4 py-3.5 ${i !== count - 1 ? "border-b border-[#eef0f2] dark:border-[#252525]" : ""}`}
        >
          <div className="skeleton w-9 h-9 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-3.5 w-32 rounded-md" />
            <div className="skeleton h-3 w-full mt-2 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const IntegrationsTable = ({ integrations, onRevokeClick }) => (
  <div className={FUSE_LIST_TABLE_WRAP}>
    <div className="md:hidden">
      {integrations.map((item, idx) => (
        <IntegrationListItem
          key={item.id}
          integration={item}
          onRevokeClick={onRevokeClick}
          isLast={idx === integrations.length - 1}
        />
      ))}
    </div>

    <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <FuseListingTableHead>
          <th className={FUSE_LIST_TH}>Name</th>
          <th className={`${FUSE_LIST_TH} hidden sm:table-cell`}>Description</th>
          <th className={`${FUSE_LIST_TH} hidden md:table-cell`}>Account</th>
          <th className={`${FUSE_LIST_TH} text-right`}>Status</th>
          <th className={`${FUSE_LIST_TH} text-right w-[140px]`} />
        </FuseListingTableHead>
        <tbody>
          {integrations.map((item) => (
            <IntegrationRow
              key={item.id}
              integration={item}
              onRevokeClick={onRevokeClick}
            />
          ))}
        </tbody>
      </table>
    </div>

    {integrations.length > 0 && (
      <FuseListingTableFooter
        count={integrations.length}
        singular="integration"
        plural="integrations"
      />
    )}
  </div>
);

export default IntegrationsTable;
