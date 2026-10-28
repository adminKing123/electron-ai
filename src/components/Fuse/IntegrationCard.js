import React, { useState } from "react";
import { TbPlug } from "react-icons/tb";
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
  FuseListingTableFooter,
  FuseListingTableHead,
} from "./fuseListingTable";

const AUTH_START_API = {
  gmail: startGmailAuthAPI,
  webex: startWebexAuthAPI,
  google_sheets: startGoogleSheetsAuthAPI,
  github: startGithubAuthAPI,
};

const actionBtn =
  "inline-flex items-center justify-center h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

/** Placeholder rows while integrations load (matches typical list size, not every slot). */
export const INTEGRATION_SKELETON_ROW_COUNT = 4;

const StatusPill = ({ connected }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
      connected
        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
        : "text-ink-550 dark:text-ink-450 bg-ink-100 dark:bg-void-800"
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-ink-400 dark:bg-ink-600"}`} />
    {connected ? "Connected" : "Not connected"}
  </span>
);

const IntegrationEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center select-none">
    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
      <TbPlug className="w-6 h-6 text-brand-600 dark:text-brand-400" />
    </div>
    <p className="text-[15px] font-semibold text-ink-975 dark:text-white">
      No integrations available
    </p>
    <p className="text-[13px] text-ink-500 dark:text-ink-500 mt-1 max-w-xs">
      Connected accounts will appear here once they are ready to use in workflows.
    </p>
  </div>
);

const IntegrationActions = ({ integration, connected, configuring, onConfigure, onRevokeClick }) => {
  const openInfoModal = useIntegrationInfoModalStore((state) => state.openModal);

  if (connected) {
    return (
      <>
        <button
          type="button"
          onClick={onRevokeClick}
          className={`${actionBtn} text-red-600 dark:text-red-400 hover:bg-red-500/10`}
        >
          Revoke
        </button>
        <button
          type="button"
          onClick={() => openInfoModal(integration.id)}
          className={`${actionBtn} border border-ink-150 dark:border-void-750 bg-white dark:bg-void-800
            text-ink-750 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-void-775`}
        >
          Details
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={onConfigure}
      disabled={configuring}
      className={`${actionBtn} gap-1.5 bg-brand-600 dark:bg-brand-500 text-white dark:text-[var(--brand-on-solid)]
        hover:bg-brand-700 dark:hover:bg-brand-600`}
    >
      {configuring && (
        <span className="w-3.5 h-3.5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
      )}
      {configuring ? "Connecting…" : "Connect"}
    </button>
  );
};

const useIntegrationActions = (integration) => {
  const [configuring, setConfiguring] = useState(false);

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

  return { configuring, handleConfigure, connected: integration.configured };
};

export function IntegrationRowSkeleton({ isLast = false, desktop = false }) {
  if (desktop) {
    return (
      <tr className="border-b border-ink-100 dark:border-void-800 last:border-b-0" aria-hidden>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
            <div>
              <div className="skeleton h-3.5 w-28 rounded-md" />
              <div className="skeleton h-3 w-52 rounded-md mt-2" />
            </div>
          </div>
        </td>
        <td className="px-5 py-3.5">
          <div className="skeleton h-5 w-[108px] rounded-full" />
        </td>
        <td className="px-5 py-3.5">
          <div className="flex justify-end">
            <div className="skeleton h-8 w-20 rounded-lg" />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${
        !isLast ? "border-b border-ink-100 dark:border-void-800" : ""
      }`}
      aria-hidden
    >
      <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="skeleton h-3.5 w-28 rounded-md" />
        <div className="skeleton h-3 w-40 rounded-md mt-2" />
      </div>
      <div className="skeleton h-8 w-20 rounded-lg flex-shrink-0" />
    </div>
  );
}

const IntegrationListItem = ({ integration, onRevokeClick, isLast }) => {
  const { configuring, handleConfigure, connected } = useIntegrationActions(integration);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5
        ${!isLast ? "border-b border-ink-100 dark:border-void-800" : ""}`}
    >
      <IntegrationIconTile iconName={integration.icon} tileClassName="w-8 h-8" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-ink-975 dark:text-white truncate">
          {integration.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <StatusPill connected={connected} />
          {integration.description && (
            <p className="text-[12px] text-ink-500 dark:text-ink-500 truncate">
              {integration.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <IntegrationActions
          integration={integration}
          connected={connected}
          configuring={configuring}
          onConfigure={handleConfigure}
          onRevokeClick={onRevokeClick}
        />
      </div>
    </div>
  );
};

const IntegrationRow = ({ integration, onRevokeClick }) => {
  const { configuring, handleConfigure, connected } = useIntegrationActions(integration);

  return (
    <tr className={FUSE_LIST_ROW}>
      <td className={FUSE_LIST_TD}>
        <div className="flex items-center gap-3 min-w-0">
          <IntegrationIconTile iconName={integration.icon} tileClassName="w-8 h-8" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-ink-975 dark:text-white truncate">
              {integration.name}
            </p>
            {integration.description && (
              <p className="text-[12px] text-ink-500 dark:text-ink-500 mt-0.5 line-clamp-1">
                {integration.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className={FUSE_LIST_TD}>
        <StatusPill connected={connected} />
      </td>
      <td className={`${FUSE_LIST_TD} text-right`}>
        <div className="flex items-center justify-end gap-1.5">
          <IntegrationActions
            integration={integration}
            connected={connected}
            configuring={configuring}
            onConfigure={handleConfigure}
            onRevokeClick={onRevokeClick}
          />
        </div>
      </td>
    </tr>
  );
};

const IntegrationsTable = ({ loading, integrations, onRevokeClick }) => {
  const rows = loading
    ? [...Array(INTEGRATION_SKELETON_ROW_COUNT)]
    : integrations;

  return (
    <div className={FUSE_LIST_TABLE_WRAP}>
      <div className="md:hidden">
        {loading ? (
          rows.map((_, i) => (
            <IntegrationRowSkeleton key={i} isLast={i === rows.length - 1} desktop={false} />
          ))
        ) : integrations.length === 0 ? (
          <IntegrationEmptyState />
        ) : (
          integrations.map((integration, idx) => (
            <IntegrationListItem
              key={integration.id}
              integration={integration}
              onRevokeClick={() => onRevokeClick(integration)}
              isLast={idx === integrations.length - 1}
            />
          ))
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <FuseListingTableHead>
            <th className={FUSE_LIST_TH}>Integration</th>
            <th className={`${FUSE_LIST_TH} w-[160px]`}>Status</th>
            <th className={`${FUSE_LIST_TH} w-[180px]`} />
          </FuseListingTableHead>
          <tbody>
            {loading ? (
              rows.map((_, i) => <IntegrationRowSkeleton key={i} desktop />)
            ) : integrations.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <IntegrationEmptyState />
                </td>
              </tr>
            ) : (
              integrations.map((integration) => (
                <IntegrationRow
                  key={integration.id}
                  integration={integration}
                  onRevokeClick={() => onRevokeClick(integration)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && integrations.length > 0 && (
        <FuseListingTableFooter
          count={integrations.length}
          singular="integration"
          plural="integrations"
        />
      )}
    </div>
  );
};

export default IntegrationsTable;
