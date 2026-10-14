import React, { useState } from "react";
import {
  startGmailAuthAPI,
  startWebexAuthAPI,
  startGoogleSheetsAuthAPI,
  startGithubAuthAPI,
} from "../../apis/fuse/queryFunctions";
import useIntegrationInfoModalStore from "../../store/useIntegrationInfoModalStore";
import { IoRemoveCircleOutline } from "react-icons/io5";
import { LuInfo } from "react-icons/lu";
import IntegrationIconTile from "./IntegrationIconTile";

const AUTH_START_API = {
  gmail: startGmailAuthAPI,
  webex: startWebexAuthAPI,
  google_sheets: startGoogleSheetsAuthAPI,
  github: startGithubAuthAPI,
};

const InfoButton = ({ onClick, loading = false }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="rounded-full text-[13px] font-semibold select-none
      text-[#333] dark:text-[#ccc]
      hover:bg-[#f0f0f0] dark:hover:bg-[#2e2e2e]
      active:opacity-80 transition-colors duration-150
      disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <LuInfo />
  </button>
);

const RevokeButton = ({ onClick, loading = false }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="py-1 rounded-full text-[11px] font-semibold select-none
      text-red-600 dark:text-red-400
      active:opacity-80 transition-colors duration-150
      disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span>
      <IoRemoveCircleOutline className="inline-block mr-1" />
    </span>
    Revoke Access
  </button>
);

const ConfigureButton = ({ onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="px-3 py-1 rounded-full text-[11px] font-semibold select-none
      border border-[#d0d0d0] dark:border-[#3a3a3a]
      text-[#333] dark:text-[#ccc]
      hover:bg-[#f0f0f0] dark:hover:bg-[#2e2e2e]
      active:opacity-80 transition-colors duration-150
      disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Configure
  </button>
);

const IntegrationCard = ({ integration, onRevokeClick }) => {
  const [configuring, setConfiguring] = useState(false);
  const openInfoModal = useIntegrationInfoModalStore(
    (state) => state.openModal,
  );

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

  const handleInfoClick = () => {
    openInfoModal(integration.id);
  };

  return (
    <div className="bg-[#ffffff] dark:bg-[#202020] rounded-3xl shadow-sm
      border border-[#e5e5e5] dark:border-[#2a2a2a] min-w-0
      flex flex-col items-start justify-between p-5 md:p-6">
      {/* Icon + text */}
      <div className="flex flex-col items-start gap-3 w-full">
        <IntegrationIconTile iconName={integration.icon} />
        <div>
          <h3 className="text-[#1a1a1a] dark:text-white font-sans text-base font-semibold leading-tight">
            {integration.name}
          </h3>
          <p className="text-[#666666] dark:text-[#d0d0d0] font-sans text-[13px] mt-1.5">
            {integration.description}
          </p>
        </div>
      </div>

      {/* Actions — always at the bottom */}
      <div className="mt-4 flex items-center justify-between gap-2 w-full">
        {integration.configured ? (
          <>
            <RevokeButton onClick={onRevokeClick} />
            <InfoButton onClick={handleInfoClick} />
          </>
        ) : (
          <ConfigureButton onClick={handleConfigure} loading={configuring} />
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;
